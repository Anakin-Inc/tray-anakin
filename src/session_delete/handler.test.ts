import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { sessionDeleteHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real call against https://api.anakin.io/v1/sessions/:id — makes a real
// HTTP call, same as every other handler.test.ts in this connector.
OperationHandlerTestSetup.configureHandlerTest(sessionDeleteHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should delete a saved browser session", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ id: "sess_example" }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(typeof outputValue).toBe("object");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
