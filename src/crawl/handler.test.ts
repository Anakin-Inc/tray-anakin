import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { crawlHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real submit-then-poll job against https://api.anakin.io/v1/crawl — makes
// real HTTP calls, same as every other handler.test.ts in this connector.
// See url_scraper/handler.test.ts for why the Jest timeout is raised.
jest.setTimeout(110_000);

OperationHandlerTestSetup.configureHandlerTest(crawlHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should crawl a site and return pages", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ url: "https://example.com", maxPages: 1 }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(outputValue.status).toEqual("completed");
          expect(Array.isArray(outputValue.pages)).toBe(true);
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
