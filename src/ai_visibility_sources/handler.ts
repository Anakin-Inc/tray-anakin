import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { AiVisibilitySourcesInput } from "./input";
import { AiVisibilitySourcesOutput } from "./output";

// GET /ai-visibility/sources — synchronous, no parameters, single request/
// response pair, so this is a plain `usingHttp` operation.
export const aiVisibilitySourcesHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  AiVisibilitySourcesInput,
  AiVisibilitySourcesOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .get("/ai-visibility/sources")
      .handleRequest((_ctx, _input, request) => request.withoutBody())
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
