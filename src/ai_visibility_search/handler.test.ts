import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { aiVisibilitySearchHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real submit-then-poll job against https://api.anakin.io/v1/ai-visibility/search
// — makes real HTTP calls, same as every other handler.test.ts in this
// connector. See url_scraper/handler.test.ts for why the Jest timeout is
// raised.
jest.setTimeout(110_000);

OperationHandlerTestSetup.configureHandlerTest(aiVisibilitySearchHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should compare AI engine answers", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ query: "What is Anakin?" }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(outputValue.status).not.toEqual("running");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
