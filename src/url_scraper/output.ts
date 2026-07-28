// Field names match the wire shape read directly from anakin-py's
// src/anakin/models.py (Document) — the reference SDK implementation for
// this same API, not guessed from the endpoint name.
export type UrlScraperOutput = {
  id: string;
  url: string;
  status: "completed" | "failed";
  cached?: boolean;
  durationMs?: number;
  createdAt?: string;
  completedAt?: string;

  // Content (only the formats requested are populated).
  markdown?: string;
  html?: string;
  cleanedHtml?: string;
  links?: string[];
  images?: string[];
  summary?: string;
  // Shape is caller/site-defined (AI-extracted structured data, only present
  // when `generateJson: true` was passed) — modeled as an open object rather
  // than a fixed schema for the same reason coda-anakin's ScrapeResultSchema
  // does (see that submission's pack.ts).
  generatedJson?: Record<string, unknown>;
  screenshotUrl?: string;
  fullPageScreenshotUrl?: string;

  // Only populated if status is "failed".
  error?: string;
};
