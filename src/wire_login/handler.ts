import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { WireLoginInput } from "./input";
import { WireLoginOutput } from "./output";

// POST /wire/login — synchronous, single request/response pair, so this is
// a plain `usingHttp` operation.
export const wireLoginHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  WireLoginInput,
  WireLoginOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .post("/wire/login")
      .handleRequest((_ctx, input, request) => {
        const body: Record<string, unknown> = { catalog_slug: input.catalog_slug };
        if (input.params) body.params = input.params;
        if (input.identity_name) body.identity_name = input.identity_name;
        if (input.source_id) body.source_id = input.source_id;
        if (input.source_ref) body.source_ref = input.source_ref;
        // `params`/`source_ref` are open, caller-supplied JSON (see
        // input.ts) — the DSL's `DynamicType` is a closed recursive union
        // that can't statically describe "arbitrary passthrough JSON," so
        // this is the same narrow, deliberate cast as
        // ../wire_build/handler.ts and ../monitor_create/handler.ts.
        return request.withBodyAsJson(body as any);
      })
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
