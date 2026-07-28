import { OperationGlobalConfigHttp } from "@trayio/cdk-dsl/connector/operation/OperationGlobalConfig";
import { TrayAnakinAuth } from "./TrayAnakinAuth";

/*
 * IMPORTANT NOTE: DO NOT DELETE THIS FILE
 * This is a global configuration that is used by all operations in the connector.
 * Update the baseUrl to the base url of the API.
 * To configure the auth use the withBearerToken method or use addHeader method to add custom headers.
 *
 * IMPORTANT NOTE: Do not change the name of the variable `globalConfigHttp` as it is used by the internal Raw Http Operation.
 * You can ignore this configuration if you have disabled the Raw Http Operation in connector.json
 *
 * Anakin authenticates with a static API key sent as the `X-API-Key` header
 * (confirmed in anakin-py's src/anakin/_http.py — not a `Bearer` token, so
 * `withBearerToken` is the wrong tool here; `addHeader` is, matching the
 * same pattern the real connector-with-subdomain-example in trayio's
 * CDK-examples-public repo uses for Shopify's `X-Shopify-Access-Token`).
 *
 * NOTE: this global configuration only applies to the `usingHttp` operation
 * (`search/handler.ts`) and to the connector's built-in Raw Http operation.
 * The two composite operations (`url_scraper`, `agentic_search`) submit and
 * poll a job over multiple HTTP calls each, which is outside what
 * `usingHttp`/`OperationGlobalConfigHttp` supports (a single
 * request/response pair) — the real composite-example connector in
 * CDK-examples-public makes its own `axios` calls directly inside
 * `usingComposite` instead of going through this config, and this connector
 * does the same. Those two handlers build the `X-API-Key` header and base
 * URL themselves; see the comment at the top of each for why.
 */
export const globalConfigHttp = OperationGlobalConfigHttp.create<TrayAnakinAuth>()
  .withBaseUrl((_ctx) => `https://api.anakin.io/v1`)
  .addHeader((ctx) => ({ name: "X-API-Key", value: ctx.auth!.user.api_key }));
