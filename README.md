# tray-anakin

Tray.io CDK connector for [Anakin](https://anakin.io) — web scraping,
AI-powered search, and multi-stage agentic research over hundreds of popular
sites.

## What's covered

Three operations, matching the same baseline every other single-purpose
Anakin integration built this session covers:

- **Scrape URL** (`url_scraper`) — submits `POST /v1/url-scraper`, then polls
  `GET /v1/url-scraper/:jobId` until the job completes or fails. Returns
  markdown (and structured JSON, if `generateJson` was set). Built as a
  `usingComposite` operation (submit + poll is "a complex http operation that
  requires multiple steps," which the real CDK-examples-public repo's own
  README says composite is for — see SUBMIT.md).
- **Search** (`search`) — calls `POST /v1/search`. Synchronous, no polling.
  Costs 3 credits per call. Built as a plain `usingHttp` operation — a single
  request/response pair.
- **Agentic Search** (`agentic_search`) — submits `POST /v1/agentic-search`,
  then polls `GET /v1/agentic-search/:jobId`. Returns an AI-generated summary
  plus structured data. Costs 10 credits. `schema` (an optional JSON Schema)
  is a plain object field — a CDK operation's input is a TypeScript type, not
  a form that restricts you to primitives, so (unlike this session's
  coda-anakin submission, whose Coda formula parameters can't accept
  arbitrary objects and has to JSON-encode `schema` as a string) it's passed
  straight through, no encoding workaround needed.

## Install

```sh
npm install
```

Installs the real `@trayio/cdk-dsl`/`@trayio/cdk-runtime` (pinned to
`5.30.0`, the current npm `latest` at the time this was built — the CLI
scaffolds `"*"` by default; pinned here deliberately, same call this
session's coda-anakin submission made for `@codahq/packs-sdk`), plus `axios`
(used directly inside the two composite operations — see below), TypeScript,
and Jest.

## Auth

Anakin uses a static API key sent as the `X-API-Key` header — modeled as
`TokenOperationHandlerAuth<{ api_key: string }, {}>` in
`src/TrayAnakinAuth.ts`, wired into every `usingHttp` request via
`OperationGlobalConfigHttp.addHeader` in `src/GlobalConfig.ts` (`addHeader`,
not `withBearerToken` — Anakin's header isn't a `Bearer` token; this is the
same `addHeader`-with-a-custom-header-name pattern the real
`connector-with-subdomain-example` in trayio's CDK-examples-public repo uses
for Shopify's `X-Shopify-Access-Token`). Get a free key at
[anakin.io/dashboard](https://anakin.io/dashboard) — 300 credits, no card
required.

The two composite operations (`url_scraper`, `agentic_search`) don't go
through `OperationGlobalConfigHttp` at all — see the note at the top of
`src/GlobalConfig.ts` for why, and `src/url_scraper/handler.ts` /
`src/agentic_search/handler.ts` for how they build the header themselves.

## Limitation: polling vs. a CDK connector's own step timeout

`url_scraper` and `agentic_search` are async on Anakin's side (submit, then
poll). A CDK connector operation has no first-class "pause and resume later"
mechanism for a regular request/response operation (the CDK does have a
polling abstraction — `configureTriggerPollRequestHandler` — but it's scoped
to trigger/webhook event polling, not to waiting out a single long-running
job inside a normal operation; see SUBMIT.md). And a single workflow step
still has a hard ceiling: a **self-built CDK connector's own operation gets
120 seconds** per step (vs. 45 seconds for a standard/marketplace connector —
confirmed at
[tray.ai/documentation/platform/enterprise-core/logs-debugging/technical-limits](https://tray.ai/documentation/platform/enterprise-core/logs-debugging/technical-limits),
"Technical limits, timeouts and retries").

Given that, both operations poll inside `usingComposite`'s handler function
on a 3s interval with a 100s internal deadline — comfortably under the 120s
ceiling — and return a `timeoutError` with a clear message if the job is
still running when the deadline hits, rather than letting Tray's workflow
engine kill the step silently. Anakin keeps the job running server-side
regardless of whether this step is still polling it — the user can re-run
the step and a fresh poll will very likely see it already finished. This is
the same tradeoff and the same shape of fix this session's coda-anakin
submission made for Coda's ~60s formula-execution ceiling, on a different
platform with a different (2x longer) ceiling.

## Precedent

The real CDK-examples-public repo's own README explicitly recommends this
shape: "Composite operations are most suited to non-http operations... or
complex http operations that require multiple steps or multiple http
requests with conditional logic" — and its `create_or_update_post` example
makes plain `axios` calls inside `usingComposite` for exactly that reason,
which is the pattern `url_scraper`/`agentic_search` follow here (not a novel
structure invented for this submission).

## Steps (needs the account owner)

Tray CDK connectors deploy privately to your own Tray organization and are
shared by explicit permission grant — there is no public marketplace
self-submission flow the way Coda has a public Pack gallery (confirmed at
[tray.ai's CDK deployment-via-CLI docs](https://tray.ai/documentation/developer/developer-portal/cdk/deployment/using-cli/)).

1. Create an RBAC API token in the Tray platform's API management settings
   for a real Tray organization.
2. `export TRAY_API_URL=https://api.tray.io TRAY_API_TOKEN=<token>` (region-
   specific URL — `api.eu1.tray.io` / `api.ap1.tray.io` for EU/APAC).
3. `npx tray-cdk deployment create --us` (or `--eu`/`--ap`/`--ap2`) — builds,
   tests, and deploys the connector; prints a deployment UUID.
4. `npx tray-cdk deployment get tray-anakin 1.0 <uuid>` — poll until the
   deployment reaches `deployed` (goes `building` → `deploying` →
   `deployed`/`failed`).
5. `npx tray-cdk permissions add tray-anakin 1.0 --email="..."` — the
   connector is owned by the API user that deployed it; this is what makes
   it visible to other users in the org.
