# tray-anakin

Tray.io CDK connector for [Anakin](https://anakin.io) — web scraping,
AI-powered search, multi-stage agentic research, Wire site automation,
website monitoring, AI-visibility tracking, and AI browser automation, over
hundreds of popular sites.

## What's covered

All 21 of Anakin's `api.anakin.io/v1` capabilities — the same capability set
exposed by Anakin's own MCP server (`anakin-mcp`), read directly from
`anakin-mcp/src/client.ts` and `anakin-mcp/src/tools/*.ts`, not guessed from
endpoint names. Grouped by family:

**Scraping & search**
- **Scrape URL** (`url_scraper`) — submits `POST /v1/url-scraper`, polls
  `GET /v1/url-scraper/:jobId`. Returns markdown (and structured JSON, if
  `generateJson` was set).
- **Map Site** (`map`) — submits `POST /v1/map`, polls `GET /v1/map/:jobId`.
  Discovers all reachable URLs under a site.
- **Crawl Site** (`crawl`) — submits `POST /v1/crawl`, polls
  `GET /v1/crawl/:jobId`. Bulk-fetches markdown across a site.
- **Search** (`search`) — `POST /v1/search`. Synchronous, no polling.
- **Agentic Search** (`agentic_search`) — submits `POST /v1/agentic-search`,
  polls `GET /v1/agentic-search/:jobId`. AI-generated summary plus
  structured data. `schema` (an optional JSON Schema) is a plain object
  field — a CDK operation's input is a TypeScript type, not a form
  restricted to primitives — passed straight through, unparsed.

**Wire (pre-built site automation catalog)**
- **Wire: Discover Actions** (`wire_discover`) — `GET /v1/wire/resolve`.
  Natural-language intent → ranked candidate actions. **Public — no API key
  required** (confirmed live against production; see "Verified, not
  assumed" in SUBMIT.md).
- **Wire: Browse Catalog** (`wire_catalog`) — `GET /v1/wire/catalog` or
  `GET /v1/wire/catalog/:slug`. **Also public**, confirmed the same way.
  Built as `usingComposite` (a single hand-built call, no polling) because
  the path itself branches on whether `slug` was supplied — `usingHttp`
  takes one static path per operation, with no conditional-segment support.
- **Wire: Run Read Action** (`wire_read_action`) / **Wire: Run Write Action**
  (`wire_write_action`) — both submit `POST /v1/wire/task`, then either
  return the terminal data inline (sync actions, no `job_id`) or poll
  `GET /v1/wire/jobs/:jobId` (async actions), honoring the server's
  `retry_after_ms` pacing hint (clamped to 500ms–10s). Split into two
  operations — not one operation with a read/write flag — so each carries an
  honest description of what it does to the target site, matching
  anakin-mcp's own `wire_read_action`/`wire_write_action` MCP tool split
  (`src/tools/wire.ts`).
- **Wire: List Identities** (`wire_identities`) — `GET /v1/wire/identities`.
- **Wire: Sign In** (`wire_login`) — `POST /v1/wire/login`.
- **Wire: Build New Action** (`wire_build`) — `POST /v1/wire/build-request`.

**Website monitoring**
- **Monitor: Create** (`monitor_create`) — `POST /v1/monitors`. Only fields
  the caller actually set are sent; the API applies its own defaults for the
  rest.
- **Monitor: List** (`monitor_list`) — `GET /v1/monitors` or
  `GET /v1/monitors/:id`. `usingComposite` for the same conditional-path
  reason as `wire_catalog`.
- **Monitor: Get Changes** (`monitor_changes`) —
  `GET /v1/monitors/:id/changes`.
- **Monitor: Control** (`monitor_control`) — `POST /v1/monitors/:id/pause`,
  `.../resume`, `.../run`, or `DELETE /v1/monitors/:id`, selected by an
  `action` input. `usingComposite`: the widest conditional-logic case in
  this connector — `action` changes both the path *and* the HTTP method.

**AI visibility**
- **AI Visibility: Search** (`ai_visibility_search`) — submits
  `POST /v1/ai-visibility/search`, polls
  `GET /v1/ai-visibility/search/:searchId` until status is no longer
  `"running"`. A `"failed"` run is still returned (not thrown) — the payload
  can carry per-source results and errors either way.
- **AI Visibility: List Sources** (`ai_visibility_sources`) —
  `GET /v1/ai-visibility/sources`.

**Browser sessions**
- **Session: List** (`session_list`) — `GET /v1/sessions`.
- **Session: Delete** (`session_delete`) — `DELETE /v1/sessions/:id`.

**AI browser automation**
- **Run Browser Task** (`browser_task`) — submits `POST /v1/ai/evaluate`
  with `async: true` (the sync variant blocks for up to ~5.5 minutes), polls
  `GET /v1/ai/jobs/:workflowId`. Anakin hard-caps a browser task at ~330s
  server-side, longer than this operation's 100s poll budget — see
  "Limitation" below.

12 operations are `usingHttp` (a single request/response pair); 9 are
`usingComposite` — either genuinely async submit-then-poll (`url_scraper`,
`map`, `crawl`, `agentic_search`, `wire_read_action`, `wire_write_action`,
`ai_visibility_search`, `browser_task`) or a single call whose path and/or
method depends on the input, which `usingHttp`'s static-path builder can't
express (`wire_catalog`, `monitor_list`, `monitor_control`).

## Install

```sh
npm install
```

Installs the real `@trayio/cdk-dsl`/`@trayio/cdk-runtime` (pinned to
`5.30.0`), plus `axios` (used directly inside the composite operations),
TypeScript, and Jest.

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

The `usingComposite` operations don't go through `OperationGlobalConfigHttp`
at all — see the note at the top of `src/GlobalConfig.ts` for why; each
builds the `X-API-Key` header itself.

Two operations — **Wire: Discover Actions** and **Wire: Browse Catalog** —
turn out not to need a valid key at all: confirmed live, both return a real
`200` from production `api.anakin.io` even with no API key set (Wire's
catalog and discovery endpoints are public — see SUBMIT.md). The connector
still requires an Anakin authentication be connected to run any operation in
Tray (consistent with the rest of the connector), but a free or even expired
key works fine for these two specifically.

## Limitation: polling vs. a CDK connector's own step timeout

Eight operations are async on Anakin's side (submit, then poll):
`url_scraper`, `map`, `crawl`, `agentic_search`, `wire_read_action`,
`wire_write_action`, `ai_visibility_search`, `browser_task`. A CDK connector
operation has no first-class "pause and resume later" mechanism for a
regular request/response operation (the CDK does have a polling abstraction
— `configureTriggerPollRequestHandler` — but it's scoped to trigger/webhook
event polling, not to waiting out a single long-running job inside a normal
operation; see SUBMIT.md). And a single workflow step still has a hard
ceiling: a **self-built CDK connector's own operation gets 120 seconds** per
step (vs. 45 seconds for a standard/marketplace connector — confirmed at
[tray.ai/documentation/platform/enterprise-core/logs-debugging/technical-limits](https://tray.ai/documentation/platform/enterprise-core/logs-debugging/technical-limits),
"Technical limits, timeouts and retries").

Given that, all eight poll inside `usingComposite`'s handler function on a
3s interval (`wire_read_action`/`wire_write_action` instead honor the
server's `retry_after_ms` pacing hint, clamped to 500ms–10s) with a 100s
internal deadline — comfortably under the 120s ceiling — and return a
`timeoutError` with a clear message if the job is still running when the
deadline hits, rather than letting Tray's workflow engine kill the step
silently. Anakin keeps the job running server-side regardless of whether
this step is still polling it — the user can re-run the step and a fresh
poll will very likely see it already finished.

**`browser_task` is the operation most likely to actually hit that
`timeoutError` path in practice.** Anakin hard-caps a browser task at ~330s
server-side (per anakin-mcp's `BROWSER_TASK_POLL_MAX_ATTEMPTS`, 6 minutes of
polling there vs. 3 minutes for every other job type) — longer than this
operation's 100s poll budget. A long-running browser task will frequently
still be `"running"` when this operation's deadline hits and need at least
one re-run of the step to pick up the finished result. This is a real,
structural gap between Anakin's slowest job type and a single CDK step's
ceiling, not a bug, and there is no clean fix on the connector side alone —
the same tradeoff and shape of fix this session's coda-anakin submission
made for Coda's ~60s formula-execution ceiling, on a different platform with
a different (2x longer, and here still insufficient for the slowest job
type) ceiling.

## Precedent

The real CDK-examples-public repo's own README explicitly recommends this
shape: "Composite operations are most suited to non-http operations... or
complex http operations that require multiple steps or multiple http
requests with conditional logic" — its `create_or_update_post` example
covers the submit-then-poll case (multiple requests) that eight operations
here follow, and the same guidance covers `wire_catalog`/`monitor_list`/
`monitor_control`'s single-request-but-conditional-path-or-method case. Not
a novel structure invented for this submission.

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
