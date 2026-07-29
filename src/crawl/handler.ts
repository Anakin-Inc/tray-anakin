import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { CrawlInput } from "./input";
import { CrawlOutput } from "./output";
import axios from "axios";

// Submit-then-poll, same shape and same reasoning as ../url_scraper/handler.ts:
// POST /crawl submits the crawl job, then GET /crawl/:jobId is polled until
// it completes or fails.

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

export const crawlHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  CrawlInput,
  CrawlOutput
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
      maxPages: input.maxPages ?? 10,
      depth: input.depth ?? 1,
      country: input.country ?? "us",
      useBrowser: input.useBrowser ?? false,
    };
    if (input.includePatterns) body.includePatterns = input.includePatterns;
    if (input.excludePatterns) body.excludePatterns = input.excludePatterns;
    if (input.sessionId) body.sessionId = input.sessionId;
    if (input.sessionName) body.sessionName = input.sessionName;

    let jobId: string | undefined;
    try {
      const submitted = await axios.post(`${BASE_URL}/crawl`, body, { headers });
      jobId = submitted.data?.jobId;
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin crawl submission failed: ${info.message}`, info)
      );
    }
    if (!jobId) {
      return OperationHandlerResult.failure(
        OperationHandlerError.connectorError(
          "Anakin's crawl submission response did not include a jobId — this usually means an API/connector version mismatch."
        )
      );
    }

    const deadline = Date.now() + POLL_DEADLINE_MS;
    let job: CrawlOutput;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const polled = await axios.get(`${BASE_URL}/crawl/${jobId}`, { headers });
        job = polled.data as CrawlOutput;
      } catch (e: unknown) {
        const info = axiosErrorInfo(e);
        return OperationHandlerResult.failure(
          OperationHandlerError.apiError(`Anakin crawl poll failed: ${info.message}`, info)
        );
      }
      if (job.status === "completed" || job.status === "failed") break;
      if (Date.now() >= deadline) {
        return OperationHandlerResult.failure(
          OperationHandlerError.timeoutError(
            `Anakin crawl job ${jobId} is still "${
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
        OperationHandlerError.apiError(`Anakin crawl job failed: ${job.error ?? "unknown error"}`, {
          jobId,
        })
      );
    }

    return OperationHandlerResult.success(job);
  })
);
