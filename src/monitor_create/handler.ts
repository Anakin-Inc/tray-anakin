import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { MonitorCreateInput } from "./input";
import { MonitorCreateOutput } from "./output";

const PASSTHROUGH_FIELDS = [
  "scope",
  "watchMode",
  "watchFormat",
  "outputSchema",
  "aiMode",
  "aiGoal",
  "useBrowser",
  "country",
  "sessionId",
  "isActive",
  "expiresAt",
  "alertWebhookUrl",
  "alertEmails",
  "maxPages",
  "maxDepth",
  "includePatterns",
  "excludePatterns",
  "wireActionId",
  "wireCatalogSlug",
  "wireCredentialId",
  "wireParams",
  "wireWatchPaths",
] as const;

// POST /monitors — synchronous accept (the monitor then runs on its own
// schedule server-side), single request/response pair, so this is a plain
// `usingHttp` operation. Only fields the caller actually set are sent — the
// API applies its own defaults for the rest (same behavior as anakin-mcp's
// monitorCreate wrapper in src/client.ts).
export const monitorCreateHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  MonitorCreateInput,
  MonitorCreateOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .post("/monitors")
      .handleRequest((_ctx, input, request) => {
        const body: Record<string, unknown> = {
          url: input.url,
          intervalMinutes: input.intervalMinutes,
        };
        for (const key of PASSTHROUGH_FIELDS) {
          const value = input[key];
          if (value !== undefined) body[key] = value;
        }
        // `outputSchema` and `wireParams` are open, caller-supplied JSON
        // (see input.ts) — the DSL's `DynamicType` is a closed recursive
        // union that can't statically describe "arbitrary passthrough
        // JSON," so this is the same narrow, deliberate cast as
        // ../wire_login/handler.ts and ../wire_build/handler.ts.
        return request.withBodyAsJson(body as any);
      })
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
