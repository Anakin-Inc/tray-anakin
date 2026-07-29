import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { monitorListHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real call against https://api.anakin.io/v1/monitors — makes a real HTTP
// call, same as every other handler.test.ts in this connector.
OperationHandlerTestSetup.configureHandlerTest(monitorListHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should list website monitors", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({}))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(typeof outputValue).toBe("object");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
