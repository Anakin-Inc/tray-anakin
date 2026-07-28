import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { wireDiscoverHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real call against https://api.anakin.io/v1/wire/resolve — makes a real
// HTTP call, same as every other handler.test.ts in this connector.
OperationHandlerTestSetup.configureHandlerTest(wireDiscoverHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should resolve an intent to candidate actions", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ q: "top phones on walmart", limit: 5 }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(Array.isArray(outputValue.results)).toBe(true);
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
