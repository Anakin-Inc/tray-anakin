// anakin-mcp's src/client.ts types sessionsList as `Promise<unknown>` — the
// saved-session roster shape isn't pinned down in the reference client
// either, modeled here as an open object for the same reason as
// wire_catalog/output.ts.
export type SessionListOutput = Record<string, unknown>;
