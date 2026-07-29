// anakin-mcp's src/client.ts types wireBuild as `Promise<unknown>` — the
// build-request response shape (status "pending", build id, etc.) isn't
// pinned down in the reference client either, modeled here as an open
// object for the same reason as wire_catalog/output.ts.
export type WireBuildOutput = Record<string, unknown>;
