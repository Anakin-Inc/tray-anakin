import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { wireWriteActionHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real submit-then-maybe-poll call against https://api.anakin.io/v1/wire/task
// — makes real HTTP calls, same as every other handler.test.ts in this
// connector. See url_scraper/handler.test.ts for why the Jest timeout is
// raised.
jest.setTimeout(110_000);

OperationHandlerTestSetup.configureHandlerTest(wireWriteActionHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should run a Wire write action", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ action_id: "example.submit_form", params: {} }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(outputValue.status).toEqual("completed");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
