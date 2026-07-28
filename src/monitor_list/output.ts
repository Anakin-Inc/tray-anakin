// The response shape depends on whether `id` was passed: no id returns a
// list of monitors, an id returns one monitor's full config/status —
// modeled as an open object for the same reason as wire_catalog/output.ts.
// anakin-mcp's src/client.ts types both monitorList() and monitorGet(id) as
// `Promise<unknown>`.
export type MonitorListOutput = Record<string, unknown>;
