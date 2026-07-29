import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { MonitorControlInput } from "./input";
import { MonitorControlOutput } from "./output";
import axios from "axios";

// `action` maps to a different path AND HTTP method (POST .../pause,
// POST .../resume, POST .../run, or DELETE) — the widest conditional-logic
// case in this connector's operation set, so `usingComposite` with a single
// hand-built axios call, same as ../wire_catalog/handler.ts and
// ../monitor_list/handler.ts but branching on method as well as path.

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

export const monitorControlHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  MonitorControlInput,
  MonitorControlOutput
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
    const base = `/monitors/${encodeURIComponent(input.id)}`;

    try {
      let response;
      switch (input.action) {
        case "pause":
          response = await axios.post(`${BASE_URL}${base}/pause`, undefined, { headers });
          break;
        case "resume":
          response = await axios.post(`${BASE_URL}${base}/resume`, undefined, { headers });
          break;
        case "run_now":
          response = await axios.post(`${BASE_URL}${base}/run`, undefined, { headers });
          break;
        case "delete":
          response = await axios.delete(`${BASE_URL}${base}`, { headers });
          break;
        default:
          return OperationHandlerResult.failure(
            OperationHandlerError.connectorError(
              `Unknown monitor action "${input.action}" — use pause, resume, run_now, or delete.`
            )
          );
      }
      return OperationHandlerResult.success((response.data ?? {}) as MonitorControlOutput);
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin monitor control request failed: ${info.message}`, info)
      );
    }
  })
);
