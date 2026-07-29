import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { SessionListInput } from "./input";
import { SessionListOutput } from "./output";

// GET /sessions?domain= — synchronous, single request/response pair, so
// this is a plain `usingHttp` operation.
export const sessionListHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  SessionListInput,
  SessionListOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .get("/sessions")
      .handleRequest((_ctx, input, request) => {
        let req = request;
        if (input.domain) req = req.addQueryString("domain", input.domain);
        return req.withoutBody();
      })
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
