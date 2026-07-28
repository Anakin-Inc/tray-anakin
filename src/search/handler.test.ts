import { OperationHandlerTestSetup } from "@trayio/cdk-dsl/connector/operation/OperationHandlerTest";
import { OperationHandlerResult } from "@trayio/cdk-dsl/connector/operation/OperationHandler";
import { searchHandler } from "./handler";
import "@trayio/cdk-runtime/connector/operation/OperationHandlerTestRunner";

// This test makes a real HTTP call against https://api.anakin.io/v1/search,
// the same way the real tmdb/get_top_rated_movies.handler.test.ts in
// trayio's CDK-examples-public repo makes a real call against TMDB — the CDK
// test runner has no built-in HTTP mocking layer. Without a real, active
// ANAKIN_API_KEY in src/test.ctx.json it will get back a real 401 from
// Anakin's live API rather than a 200; see SUBMIT.md for exactly what this
// sandbox could and couldn't verify.
OperationHandlerTestSetup.configureHandlerTest(searchHandler, (handlerTest) =>
  handlerTest
    .usingHandlerContext("test")
    .nothingBeforeAll()
    .testCase("should return search results for a prompt", (testCase) =>
      testCase
        .givenNothing()
        .when(() => ({ prompt: "what is anakin.io", limit: 3 }))
        .then(({ output }) => {
          const outputValue = OperationHandlerResult.getSuccessfulValueOrFail(output);
          expect(Array.isArray(outputValue.results)).toBe(true);
        })
        .finallyDoNothing()
    )
    .nothingAfterAll()
);
