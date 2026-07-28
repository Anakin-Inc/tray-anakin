import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { browserTaskHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real submit-then-poll job against https://api.anakin.io/v1/ai/evaluate —
// makes real HTTP calls, same as every other handler.test.ts in this
// connector. Browser tasks can run up to ~330s server-side, so this raises
// the Jest timeout further than the other composite operations' tests.
jest.setTimeout(110_000);

OperationHandlerTestSetup.configureHandlerTest(browserTaskHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should run a browser task", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({
          prompt: "Go to example.com and return the page title.",
          url: "https://example.com",
        }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(typeof outputValue).toBe("object");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
