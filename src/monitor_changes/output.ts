// anakin-mcp's src/client.ts types monitorChanges as `Promise<unknown>` —
// the change-entry shape (timestamp, diff, AI summary when aiMode is on)
// isn't pinned down in the reference client either, modeled here as an open
// object for the same reason as wire_catalog/output.ts.
export type MonitorChangesOutput = Record<string, unknown>;
