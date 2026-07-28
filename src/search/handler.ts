import { OperationHandlerSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerSetup";
import { TrayAnakinAuth } from "../TrayAnakinAuth";
import { globalConfigHttp } from "../GlobalConfig";
import { SearchInput } from "./input";
import { SearchOutput } from "./output";

// POST /v1/search — the only one of Anakin's three baseline operations that
// is synchronous. Everything else (UrlScraper, AgenticSearch) is a
// submit-then-poll job, which is why this is the one operation modeled as a
// single-request `usingHttp` handler rather than `usingComposite`.
export const searchHandler = OperationHandlerSetup.configureHandler<
  TrayAnakinAuth,
  SearchInput,
  SearchOutput
>((handler) =>
  handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
    http
      .post("/search")
      .handleRequest((_ctx, input, request) =>
        request.withBodyAsJson({
          prompt: input.prompt,
          limit: input.limit ?? 5,
        })
      )
      .handleResponse((_ctx, _input, response) => response.parseWithBodyAsJson())
  )
);
