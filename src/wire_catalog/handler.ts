import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import {
  OperationHandlerError,
  OperationHandlerResult,
} from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { WireCatalogInput } from "./input";
import { WireCatalogOutput } from "./output";
import axios from "axios";

// GET /wire/catalog or GET /wire/catalog/:slug — a single call (no polling),
// but the path itself branches on whether `slug` was supplied. The CDK's
// `usingHttp` builder takes one static path per operation with no
// conditional-segment support, so — per the real CDK-examples-public
// README's own guidance that composite is for "complex http operations...
// with conditional logic" (quoted in SUBMIT.md) — this is `usingComposite`
// with a single hand-built axios call rather than `usingHttp`.

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

export const wireCatalogHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  WireCatalogInput,
  WireCatalogOutput
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

    const path = input.slug
      ? `/wire/catalog/${encodeURIComponent(input.slug)}`
      : "/wire/catalog";

    try {
      const response = await axios.get(`${BASE_URL}${path}`, { headers });
      return OperationHandlerResult.success(response.data as WireCatalogOutput);
    } catch (e: unknown) {
      const info = axiosErrorInfo(e);
      return OperationHandlerResult.failure(
        OperationHandlerError.apiError(`Anakin wire catalog request failed: ${info.message}`, info)
      );
    }
  })
);
