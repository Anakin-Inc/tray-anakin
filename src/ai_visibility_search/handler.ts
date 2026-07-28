import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { AiVisibilitySearchInput } from "./input";
import { AiVisibilitySearchOutput } from "./output";
import axios from "axios";

// Submit-then-poll, same shape and same reasoning as ../url_scraper/handler.ts:
// POST /ai-visibility/search submits the search, then GET
// /ai-visibility/search/:searchId is polled until status is no longer
// "running" — a "failed" run is still returned (not thrown), since the
// payload can carry per-source results and errors either way (matching
// anakin-mcp's src/client.ts aiVisibilitySearch behavior).

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

export const aiVisibilitySearchHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  AiVisibilitySearchInput,
  AiVisibilitySearchOutput
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

    const body: Record<string, unknown> = { query: input.query };
    if (input.sources) body.sources = input.sources;
    if (input.country) body.country = input.country;

    let submittedData: AiVisibilitySearchOutput;
    try {
      const submitted = await axios.post(`${BASE_URL}/ai-visibility/search`, body, { headers });
      submittedData = submitted.data as AiVisibilitySearchOutput;
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin AI visibility search submission failed: ${info.message}`, info)
      );
    }
    const searchId = submittedData.search_id;
    if (!searchId) {
      return OperationHandlerResult.failure(
        OperationHandlerError.connectorError(
          "Anakin's AI visibility submission response did not include a search_id — this usually means an API/connector version mismatch."
        )
      );
    }

    const deadline = Date.now() + POLL_DEADLINE_MS;
    let search: AiVisibilitySearchOutput = submittedData;
    while (search.status === "running") {
      if (Date.now() >= deadline) {
        return OperationHandlerResult.failure(
          OperationHandlerError.timeoutError(
            `Anakin AI visibility search ${searchId} is still "running" after ${Math.round(
              POLL_DEADLINE_MS / 1000
            )}s. Anakin keeps working on the search in the background — re-run this step in a ` +
              `moment to pick up the finished result.`,
            { searchId }
          )
        );
      }
      await sleep(POLL_INTERVAL_MS);
      try {
        const polled = await axios.get(
          `${BASE_URL}/ai-visibility/search/${encodeURIComponent(searchId)}`,
          { headers }
        );
        search = polled.data as AiVisibilitySearchOutput;
      } catch (e: unknown) {
        const info = axiosErrorInfo(e);
        return OperationHandlerResult.failure(
          OperationHandlerError.apiError(`Anakin AI visibility search poll failed: ${info.message}`, info)
        );
      }
    }

    return OperationHandlerResult.success(search);
  })
);
