import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { SessionDeleteInput } from "./input";
import { SessionDeleteOutput } from "./output";

// DELETE /sessions/:id — synchronous, single request/response pair, so
// this is a plain `usingHttp` operation.
export const sessionDeleteHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  SessionDeleteInput,
  SessionDeleteOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .delete("/sessions/:id")
      .handleRequest((_ctx, input, request) =>
        request.addPathParameter("id", input.id).withoutBody()
      )
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
