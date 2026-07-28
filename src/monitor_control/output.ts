// anakin-mcp's src/client.ts types monitorControl as `Promise<unknown>` —
// modeled here as an open object for the same reason as
// wire_catalog/output.ts. Shape varies by action (pause/resume/run_now
// return the updated monitor; delete typically returns a bare
// acknowledgement).
export type MonitorControlOutput = Record<string, unknown>;
