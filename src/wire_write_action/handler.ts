import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { WireWriteActionInput } from "./input";
import { WireWriteActionOutput } from "./output";
import axios from "axios";

// Identical submit-then-maybe-poll shape to ../wire_read_action/handler.ts —
// see the comments there for the polling/pacing rationale. Split into its
// own operation (rather than a single operation with a read/write flag) so
// this one can carry its own honest description of the state it changes on
// the target site; the write/read split itself matches anakin-mcp's own
// wire_read_action/wire_write_action MCP tool split (src/tools/wire.ts).

const BASE_URL = "https://api.anakin.io/v1";
const POLL_DEADLINE_MS = 100_000;
const DEFAULT_POLL_INTERVAL_MS = 3000;

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

export const wireWriteActionHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  WireWriteActionInput,
  WireWriteActionOutput
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

    const body: Record<string, unknown> = { action_id: input.action_id };
    if (input.params && Object.keys(input.params).length > 0) body.params = input.params;
    if (input.credential_id) body.credential_id = input.credential_id;
    if (input.identity_id) body.identity_id = input.identity_id;

    let accepted: WireWriteActionOutput & { job_id?: string };
    try {
      const submitted = await axios.post(`${BASE_URL}/wire/task`, body, { headers });
      accepted = submitted.data as WireWriteActionOutput;
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin wire task submission failed: ${info.message}`, info)
      );
    }

    if (!accepted.job_id) {
      // Sync action — terminal data came back inline.
      return OperationHandlerResult.success(accepted);
    }

    const jobId = accepted.job_id;
    const deadline = Date.now() + POLL_DEADLINE_MS;
    let job: WireWriteActionOutput;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const polled = await axios.get(`${BASE_URL}/wire/jobs/${jobId}`, { headers });
        job = polled.data as WireWriteActionOutput;
      } catch (e: unknown) {
        const info = axiosErrorInfo(e);
        return OperationHandlerResult.failure(
          OperationHandlerError.apiError(`Anakin wire job poll failed: ${info.message}`, info)
        );
      }
      if (job.status === "completed" || job.status === "failed") break;
      if (Date.now() >= deadline) {
        return OperationHandlerResult.failure(
          OperationHandlerError.timeoutError(
            `Anakin wire job ${jobId} is still "${job.status}" after ${Math.round(
              POLL_DEADLINE_MS / 1000
            )}s. Anakin keeps working on the job in the background — re-run this step in a moment ` +
              `to pick up the finished result.`,
            { jobId }
          )
        );
      }
      const wait =
        typeof (job as { retry_after_ms?: number }).retry_after_ms === "number"
          ? (job as { retry_after_ms?: number }).retry_after_ms!
          : DEFAULT_POLL_INTERVAL_MS;
      await sleep(Math.min(Math.max(wait, 500), 10_000));
    }

    if (job.status === "failed") {
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(
          `Anakin wire action failed: ${job.error?.message ?? job.error?.code ?? "unknown error"}`,
          { jobId, ...job.error }
        )
      );
    }

    return OperationHandlerResult.success(job);
  })
);
