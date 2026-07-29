// anakin-mcp's src/client.ts types wireIdentities as `Promise<unknown>` —
// the identity/credential list shape is catalog-defined, modeled here as an
// open object for the same reason as wire_catalog/output.ts.
export type WireIdentitiesOutput = Record<string, unknown>;
