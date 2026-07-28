import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { UrlScraperInput } from "./input";
import { UrlScraperOutput } from "./output";
import axios from "axios";

// This is a "complex http operation that requires multiple steps" — exactly
// the case the real CDK-examples-public README says `usingComposite` (not
// `usingHttp`) is for. `usingHttp`/`OperationGlobalConfigHttp` model exactly
// one request/response pair; UrlScraper needs a POST to submit the job, then
// N GET polls until it finishes, so it's built the same way the real
// composite-example connector's create_or_update_post.handler.ts is: a plain
// `axios` call inside `usingComposite`, with the connector's own auth/base
// URL applied by hand (composite handlers do not go through
// OperationGlobalConfigHttp — see the note in ../GlobalConfig.ts).

const BASE_URL = "https://api.anakin.io/v1";

// ─── Polling ────────────────────────────────────────────────────────────
//
// A CDK connector's own operation execution has a longer ceiling than a
// stock/marketplace connector — 120s vs. 45s (confirmed at
// https://tray.ai/documentation/platform/enterprise-core/logs-debugging/technical-limits,
// "Technical limits, timeouts and retries") — but it is still a hard ceiling
// with no documented continuation/resume mechanism for a single workflow
// step (unlike, e.g., Coda's sync-table continuation, which doesn't apply to
// action formulas either — see this session's coda-anakin submission for
// that same tradeoff on a different platform). Given that, this operation
// polls in a bounded loop safely under 120s and fails loudly with a
// `timeoutError` if the job is still running when the deadline hits, rather
// than letting Tray's workflow engine kill the step silently. Anakin keeps
// the job running server-side regardless of whether this step is still
// polling it — the user can re-run the step (or build a small
// wait-and-retry loop in their Tray workflow) and a fresh poll will very
// likely see it already completed.
const POLL_INTERVAL_MS = 3000;
const POLL_DEADLINE_MS = 100_000; // Comfortably under the 120s CDK step ceiling.

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

export const urlScraperHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  UrlScraperInput,
  UrlScraperOutput
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

    const body: Record<string, unknown> = {
      url: input.url,
      country: input.country ?? "us",
      useBrowser: input.useBrowser ?? false,
      generateJson: input.generateJson ?? false,
      forceFresh: input.forceFresh ?? false,
    };
    if (input.sessionId) body.sessionId = input.sessionId;
    if (input.sessionName) body.sessionName = input.sessionName;

    let jobId: string | undefined;
    try {
      const submitted = await axios.post(`${BASE_URL}/url-scraper`, body, { headers });
      jobId = submitted.data?.jobId;
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin scrape submission failed: ${info.message}`, info)
      );
    }
    if (!jobId) {
      return OperationHandlerResult.failure(
        OperationHandlerError.connectorError(
          "Anakin's scrape submission response did not include a jobId — this usually means an API/connector version mismatch."
        )
      );
    }

    const deadline = Date.now() + POLL_DEADLINE_MS;
    let job: UrlScraperOutput;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const polled = await axios.get(`${BASE_URL}/url-scraper/${jobId}`, { headers });
        job = polled.data as UrlScraperOutput;
      } catch (e: unknown) {
        const info = axiosErrorInfo(e);
        return OperationHandlerResult.failure(
          OperationHandlerError.apiError(`Anakin scrape poll failed: ${info.message}`, info)
        );
      }
      if (job.status === "completed" || job.status === "failed") break;
      if (Date.now() >= deadline) {
        return OperationHandlerResult.failure(
          OperationHandlerError.timeoutError(
            `Anakin scrape job ${jobId} is still "${
              (job as { status?: string }).status ?? "processing"
            }" after ${Math.round(POLL_DEADLINE_MS / 1000)}s. Anakin keeps working on the job ` +
              `in the background — re-run this step in a moment to pick up the finished result.`,
            { jobId }
          )
        );
      }
      await sleep(POLL_INTERVAL_MS);
    }

    if (job.status === "failed") {
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin scrape job failed: ${job.error ?? "unknown error"}`, {
          jobId,
        })
      );
    }

    return OperationHandlerResult.success(job);
  })
);
