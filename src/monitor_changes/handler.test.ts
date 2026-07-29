import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { monitorChangesHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real call against https://api.anakin.io/v1/monitors/:id/changes — makes a
// real HTTP call, same as every other handler.test.ts in this connector.
OperationHandlerTestSetup.configureHandlerTest(monitorChangesHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should get a monitor's changes", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ id: "mon_example" }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(typeof outputValue).toBe("object");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
