// Field names match the wire shape read directly from anakin-mcp's
// src/client.ts (WireJobStatus / WireJobError) — the reference
// implementation for this same API, not guessed from the endpoint name.
// POST /wire/task returns either the terminal data inline (sync actions,
// no job_id) or { status: "processing", job_id } to poll via
// GET /wire/jobs/:jobId — this type covers both shapes.
export type WireJobError = {
  code?: string;
  message?: string;
  details?: string;
  // Present on AUTH_REQUIRED — where to connect the account.
  connect_url?: string;
};

export type WireReadActionOutput = {
  status: "processing" | "completed" | "failed";
  job_id?: string;
  // Present when completed — the action's extracted data.
  data?: Record<string, unknown>;
  credits_used?: number;
  execution_ms?: number;
  // Present when failed.
  error?: WireJobError;
};
