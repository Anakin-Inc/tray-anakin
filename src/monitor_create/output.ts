// The API returns each monitor's `alertWebhookSecret` (an HMAC signing
// secret) inline. anakin-mcp's monitor.ts redacts that field before it
// reaches an LLM (a secret in a chat transcript is compromised by
// definition); this connector operates outside a chat context, but the
// field is dropped for the same reason — a workflow log or downstream step
// is not a safe place for a live signing secret either. The rest of the
// shape is open (monitor config + status fields are numerous and evolve
// server-side) — see monitor.ts's MonitorCreateOptions for the known input
// fields this mirrors back.
export type MonitorCreateOutput = Record<string, unknown>;
