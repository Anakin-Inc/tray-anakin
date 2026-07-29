import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { MonitorChangesInput } from "./input";
import { MonitorChangesOutput } from "./output";

// GET /monitors/:id/changes — synchronous, single request/response pair,
// so this is a plain `usingHttp` operation.
export const monitorChangesHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  MonitorChangesInput,
  MonitorChangesOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .get("/monitors/:id/changes")
      .handleRequest((_ctx, input, request) =>
        request.addPathParameter("id", input.id).withoutBody()
      )
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
