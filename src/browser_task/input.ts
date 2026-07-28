export type BrowserTaskInput = {
  /**
   * @title Prompt
   * @description The task in natural language. Be specific about the goal and what to return. Never include passwords or secrets — use Session ID for authenticated sites.
   */
  prompt: string;
  /**
   * @title URL
   * @description Navigate here before starting. Omit to let the agent follow URLs named in the prompt.
   */
  url?: string;
  /**
   * @title Session ID
   * @description Saved browser-session ID (from Session: List) so the task runs logged in.
   */
  sessionId?: string;
  /**
   * @title Max Steps
   * @description Cap on agent steps (navigation/click/type actions).
   */
  maxSteps?: number;
  /**
   * @title Timeout (ms)
   * @description Task timeout in milliseconds (server caps runs at ~330s regardless).
   */
  timeoutMs?: number;
  /**
   * @title Output Schema
   * @description JSON Schema for the result — the agent returns structured data conforming to it.
   */
  outputSchema?: Record<string, unknown>;
};
