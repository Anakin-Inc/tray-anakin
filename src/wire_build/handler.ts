import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { WireBuildInput } from "./input";
import { WireBuildOutput } from "./output";

// POST /wire/build-request — synchronous accept (the build itself runs
// async server-side; this call just returns "pending" + a build id), single
// request/response pair, so this is a plain `usingHttp` operation.
export const wireBuildHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  WireBuildInput,
  WireBuildOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .post("/wire/build-request")
      .handleRequest((_ctx, input, request) => {
        const body: Record<string, unknown> = {
          website_url: input.website_url,
          goal: input.goal,
        };
        if (input.catalog_id) body.catalog_id = input.catalog_id;
        if (input.visibility) body.visibility = input.visibility;
        if (input.force !== undefined) body.force = input.force;
        // `body` is declared `Record<string, unknown>` for convenient
        // conditional assignment above; the DSL's `DynamicType` is a closed
        // recursive union TS won't structurally match against `unknown`
        // values even though every value here is a plain string/boolean —
        // same narrow, deliberate cast as ../wire_login/handler.ts and
        // ../monitor_create/handler.ts.
        return request.withBodyAsJson(body as any);
      })
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
