import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { wireBuildHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real call against https://api.anakin.io/v1/wire/build-request — makes a
// real HTTP call, same as every other handler.test.ts in this connector.
OperationHandlerTestSetup.configureHandlerTest(wireBuildHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should request a new Wire action", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({
          website_url: "https://example.com",
          goal: "Extract the page title and main heading.",
        }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(typeof outputValue).toBe("object");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
