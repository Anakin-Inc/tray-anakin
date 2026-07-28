// Field names match the wire shape read directly from anakin-mcp's
// src/client.ts (CrawlResult / CrawlPage) — the reference implementation
// for this same API, not guessed from the endpoint name.
export type CrawlPage = {
  url: string;
  status: "completed" | "failed";
  markdown?: string;
  html?: string;
  durationMs?: number;
  error?: string;
};

export type CrawlOutput = {
  id: string;
  url: string;
  status: "completed" | "failed";
  totalPages?: number;
  completedPages?: number;
  pages?: CrawlPage[];
  durationMs?: number;

  // Only populated if status is "failed".
  error?: string;
};
