import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { WireIdentitiesInput } from "./input";
import { WireIdentitiesOutput } from "./output";

// GET /wire/identities?catalog_id= — synchronous, single request/response
// pair, so this is a plain `usingHttp` operation.
export const wireIdentitiesHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  WireIdentitiesInput,
  WireIdentitiesOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .get("/wire/identities")
      .handleRequest((_ctx, input, request) => {
        let req = request;
        if (input.catalog_id) req = req.addQueryString("catalog_id", input.catalog_id);
        return req.withoutBody();
      })
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
