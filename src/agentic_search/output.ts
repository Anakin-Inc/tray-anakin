// Field names match the wire shape read directly from anakin-py's
// src/anakin/models.py (AgenticSearchResult / AgenticSearchData) — the
// reference SDK implementation for this same API, not guessed from the
// endpoint name. Note the asymmetry: the outer object is camelCase
// (generatedJson, durationMs, createdAt) but the two fields nested inside
// generatedJson are snake_case (structured_data, data_schema) — confirmed
// both in models.py's field definitions (no alias given for those two,
// meaning the bare field name is the wire key) and independently in this
// session's coda-anakin/pack.ts, which reads
// `job.generatedJson?.structured_data` for the same reason.
export type AgenticSearchData = {
  summary?: string;
  structured_data?: Record<string, unknown>;
  data_schema?: Record<string, unknown>;
};

export type AgenticSearchOutput = {
  id: string;
  status: "completed" | "failed";
  jobType?: string;
  generatedJson?: AgenticSearchData;
  cached?: boolean;
  createdAt?: string;
  completedAt?: string;
  durationMs?: number;

  // Only populated if status is "failed".
  error?: string;
};
