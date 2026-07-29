import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { aiVisibilitySourcesHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real call against https://api.anakin.io/v1/ai-visibility/sources — makes a
// real HTTP call, same as every other handler.test.ts in this connector.
OperationHandlerTestSetup.configureHandlerTest(aiVisibilitySourcesHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should list AI visibility engines", (testCase) =>
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
