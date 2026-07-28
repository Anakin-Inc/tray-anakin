// Field names match the wire shape read directly from anakin-mcp's
// src/client.ts (AIVisibilitySearch) — the reference implementation for
// this same API, not guessed from the endpoint name. Per-source results are
// modeled as an open object (each engine's own result shape — status,
// summary, latency, full_content — isn't pinned down in the reference
// client either), same reasoning as url_scraper/output.ts's generatedJson
// field.
export type AiVisibilitySearchOutput = {
  search_id: string;
  status: "running" | "completed" | "failed" | string;
  country?: string;
  synthesis?: string;
  results?: Array<Record<string, unknown>>;
};
