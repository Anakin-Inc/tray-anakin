export type AgenticSearchInput = {
  /**
   * @title Prompt
   * @description The research question or topic.
   */
  prompt: string;
  /**
   * @title Use Browser
   * @description Use a headless browser when scraping citation pages.
   * @default true
   */
  useBrowser?: boolean;
  /**
   * @title Schema
   * @description Optional JSON Schema describing the structured data to extract, e.g. {"type":"object","properties":{...}}. Unlike platforms whose formula/action parameters can't accept arbitrary objects (see this session's coda-anakin submission, which has to JSON-encode this as a string for that reason), a CDK input field is a plain TypeScript type, so this is a real object here — passed straight through to Anakin, unparsed.
   */
  schema?: Record<string, unknown>;
};
