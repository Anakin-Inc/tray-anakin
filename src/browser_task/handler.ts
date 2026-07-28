import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { BrowserTaskInput } from "./input";
import { BrowserTaskOutput } from "./output";
import axios from "axios";

// POST /ai/evaluate always submits with `async: true` (the sync variant
// blocks the HTTP request for up to ~5.5 minutes, far past any CDK step
// ceiling — same reasoning as anakin-mcp's src/client.ts browserTask), then
// GET /ai/jobs/:workflowId is polled to completion, same shape and same
// 100s/120s poll-vs-step-ceiling reasoning as ../url_scraper/handler.ts.
// Anakin hard-caps a browser task at ~330s server-side — longer than this
// operation's 100s poll budget — so a long-running task is the one case in
// this connector most likely to hit the `timeoutError` path below on a
// single run; see README.md's Limitations section. Re-running the step
// picks up the finished result once the job completes in the background.

const BASE_URL = "https://api.anakin.io/v1";
const POLL_INTERVAL_MS = 3000;
const POLL_DEADLINE_MS = 100_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function axiosErrorInfo(e: unknown): {
  message: string;
  statusCode: number | null;
  body: string | null;
} {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { message?: string } | undefined;
    return {
      message: data?.message ?? e.message,
      statusCode: e.response?.status ?? null,
      body: e.response?.data ? JSON.stringify(e.response.data) : null,
    };
  }
  return {
    message: e instanceof Error ? e.message : String(e),
    statusCode: null,
    body: null,
  };
}

type BrowserTaskJob = {
  workflow_id?: string;
  status?: "running" | "completed" | "failed" | "timed_out" | string;
  run_id?: string;
  result?: BrowserTaskOutput;
  error?: string;
};

export const browserTaskHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  BrowserTaskInput,
  BrowserTaskOutput
>((handler) =>
  handler.usingComposite(async (ctx, input, _invoke) => {
    const apiKey = ctx.auth?.user.api_key;
    if (!apiKey) {
      return OperationHandlerResult.failure(
        OperationHandlerError.connectorError(
          "Anakin API key is missing — connect an Anakin authentication (get a free key at https://anakin.io/dashboard) to use this operation."
        )
      );
    }
    const headers = { "X-API-Key": apiKey, "Content-Type": "application/json" };

    const body: Record<string, unknown> = { prompt: input.prompt, async: true };
    if (input.url) body.url = input.url;
    if (input.sessionId) body.session_id = input.sessionId;
    if (input.maxSteps !== undefined) body.max_steps = input.maxSteps;
    if (input.timeoutMs !== undefined) body.timeout_ms = input.timeoutMs;
    if (input.outputSchema) body.output_schema = input.outputSchema;

    let accepted: BrowserTaskJob;
    try {
      const submitted = await axios.post(`${BASE_URL}/ai/evaluate`, body, { headers });
      accepted = submitted.data as BrowserTaskJob;
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin browser task submission failed: ${info.message}`, info)
      );
    }

    if (!accepted.workflow_id) {
      // Service answered synchronously (shouldn't happen with async: true).
      return OperationHandlerResult.success((accepted as unknown as BrowserTaskOutput) ?? {});
    }

    const workflowId = accepted.workflow_id;
    const deadline = Date.now() + POLL_DEADLINE_MS;
    let job: BrowserTaskJob;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const polled = await axios.get(
          `${BASE_URL}/ai/jobs/${encodeURIComponent(workflowId)}`,
          { headers }
        );
        job = polled.data as BrowserTaskJob;
      } catch (e: unknown) {
        const info = axiosErrorInfo(e);
        return OperationHandlerResult.failure(
          OperationHandlerError.apiError(`Anakin browser task poll failed: ${info.message}`, info)
        );
      }
      if (job.status === "completed" || job.status === "failed" || job.status === "timed_out") break;
      if (Date.now() >= deadline) {
        return OperationHandlerResult.failure(
          OperationHandlerError.timeoutError(
            `Anakin browser task ${workflowId} is still "${
              job.status ?? "running"
            }" after ${Math.round(POLL_DEADLINE_MS / 1000)}s. Anakin caps browser tasks at ~330s ` +
              `server-side and keeps working in the background — re-run this step in a moment to ` +
              `pick up the finished result.`,
            { workflowId }
          )
        );
      }
      await sleep(POLL_INTERVAL_MS);
    }

    if (job.status === "failed" || job.status === "timed_out") {
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(
          `Anakin browser task ${job.status}: ${job.error ?? "unknown error"}`,
          { workflowId }
        )
      );
    }

    return OperationHandlerResult.success(job.result ?? ((job as unknown) as BrowserTaskOutput));
  })
);
