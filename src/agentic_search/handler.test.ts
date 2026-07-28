import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { agenticSearchHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// Real submit-then-poll job against https://api.anakin.io/v1/agentic-search
// — same real-network-call caveat as ../url_scraper/handler.test.ts. Raised
// above Jest's 5s default (see that file's comment) to cover the handler's
// own 100s polling deadline; a real multi-stage agentic-search job may
// legitimately take longer than a single scrape, which is exactly the
// "unverified without a live job" gap called out in SUBMIT.md.
jest.setTimeout(110_000);

OperationHandlerTestSetup.configureHandlerTest(agenticSearchHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should research a prompt and return a summary", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ prompt: "What is anakin.io?" }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(outputValue.status).toEqual("completed");
          expect(typeof outputValue.generatedJson?.summary).toBe("string");
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
