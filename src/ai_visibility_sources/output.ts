// anakin-mcp's src/client.ts types aiVisibilitySources as `Promise<unknown>`
// — the {slug, label} roster shape isn't pinned down in the reference
// client either, modeled here as an open object for the same reason as
// wire_catalog/output.ts.
export type AiVisibilitySourcesOutput = Record<string, unknown>;
