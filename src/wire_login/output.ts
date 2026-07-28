// anakin-mcp's src/client.ts types wireLogin as `Promise<unknown>` — the
// result shape is catalog-defined, modeled here as an open object for the
// same reason as wire_catalog/output.ts.
export type WireLoginOutput = Record<string, unknown>;
