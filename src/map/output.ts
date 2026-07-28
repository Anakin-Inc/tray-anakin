// Field names match the wire shape read directly from anakin-mcp's
// src/client.ts (MapResult) — the reference implementation for this same
// API, not guessed from the endpoint name.
export type MapOutput = {
  id: string;
  url: string;
  status: "completed" | "failed";
  links?: string[];
  totalLinks?: number;
  externalLinks?: string[];
  totalExternalLinks?: number;
  durationMs?: number;

  // Only populated if status is "failed".
  error?: string;
};
