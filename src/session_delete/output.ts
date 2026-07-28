// anakin-mcp's src/client.ts types sessionDelete as `Promise<unknown>` —
// modeled here as an open object for the same reason as
// wire_catalog/output.ts (typically a bare acknowledgement).
export type SessionDeleteOutput = Record<string, unknown>;
