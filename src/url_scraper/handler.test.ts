import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { urlScraperHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real submit-then-poll job against https://api.anakin.io/v1/url-scraper —
// makes real HTTP calls, same as every other handler.test.ts in this
// connector and in trayio's real CDK-examples-public repo (no HTTP mocking
// layer in the CDK test runner). Jest's default per-test timeout is 5s
// (confirmed at
// https://developer.tray.ai/developer-portal/cdk/troubleshooting/tips-and-faqs/,
// "Setting custom timeouts"); a real scrape job can take longer than that,
// so this raises it to comfortably cover the handler's own 100s polling
// deadline.
jest.setTimeout(110_000);

OperationHandlerTestSetup.configureHandlerTest(urlScraperHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should scrape a URL and return markdown", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ url: "https://example.com" }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(outputValue.status).toEqual("completed");
          expect(typeof outputValue.markdown).toBe("string");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
