// Shape is catalog/action-defined (each candidate carries its own action_id,
// type, params schema, credit cost, auth_mode — see wire_catalog for the
// full schema) — modeled as an open object per result rather than a fixed
// schema, same reasoning as url_scraper/output.ts's generatedJson field.
// Field names match anakin-mcp's src/client.ts (WireResolveResponse).
export type WireDiscoverOutput = {
  results?: Array<Record<string, unknown>>;
  // Suggested next call.
  next?: string;
};
