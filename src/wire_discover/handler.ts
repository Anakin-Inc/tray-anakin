import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { WireDiscoverInput } from "./input";
import { WireDiscoverOutput } from "./output";

// GET /wire/resolve?q=&limit= — synchronous, no polling. Single request/
// response pair, so this is a plain `usingHttp` operation (same reasoning
// as ../search/handler.ts).
export const wireDiscoverHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  WireDiscoverInput,
  WireDiscoverOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .get("/wire/resolve")
      .handleRequest((_ctx, input, request) => {
        let req = request.addQueryString("q", input.q);
        if (input.limit !== undefined) {
          req = req.addQueryString("limit", String(input.limit));
        }
        return req.withoutBody();
      })
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
