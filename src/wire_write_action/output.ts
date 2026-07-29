// Same wire shape as ../wire_read_action/output.ts — POST /wire/task returns
// either the terminal data inline (sync actions) or { status: "processing",
// job_id } to poll via GET /wire/jobs/:jobId.
export type WireJobError = {
  code?: string;
  message?: string;
  details?: string;
  // Present on AUTH_REQUIRED — where to connect the account.
  connect_url?: string;
};

export type WireWriteActionOutput = {
  status: "processing" | "completed" | "failed";
  job_id?: string;
  // Present when completed — the action's result data.
  data?: Record<string, unknown>;
  credits_used?: number;
  execution_ms?: number;
  // Present when failed.
  error?: WireJobError;
};
