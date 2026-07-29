// Field names match the wire shape read directly from anakin-mcp's
// src/client.ts (BrowserTaskResult / BrowserTaskJob) — the reference
// implementation for this same API, not guessed from the endpoint name.
// `result` is caller/task-defined (conforms to `outputSchema` when one was
// supplied) — modeled as an open value for the same reason as
// url_scraper/output.ts's generatedJson field.
export type BrowserTaskOutput = {
  success?: boolean;
  result?: unknown;
  steps_taken?: number;
  iterations?: number;
  cached?: boolean;
  run_id?: string;
  duration_ms?: number;

  // Only populated if the job failed or timed out.
  error?: string;
};
