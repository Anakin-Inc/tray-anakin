import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { MonitorListInput } from "./input";
import { MonitorListOutput } from "./output";
import axios from "axios";

// GET /monitors (list) or GET /monitors/:id (one monitor) — a single call
// (no polling), but the path branches on whether `id` was supplied. Same
// conditional-path reasoning as ../wire_catalog/handler.ts: `usingHttp`
// takes one static path per operation, so this is `usingComposite` with a
// single hand-built axios call.

const BASE_URL = "https://api.anakin.io/v1";

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

export const monitorListHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  MonitorListInput,
  MonitorListOutput
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

    const path = input.id ? `/monitors/${encodeURIComponent(input.id)}` : "/monitors";

    try {
      const response = await axios.get(`${BASE_URL}${path}`, { headers });
      return OperationHandlerResult.success(response.data as MonitorListOutput);
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin monitor list request failed: ${info.message}`, info)
      );
    }
  })
);
