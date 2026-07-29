export type MonitorCreateInput = {
  /**
   * @title URL
   * @description The URL to watch (root URL for site scope; the Wire site's URL for wire scope).
   */
  url: string;
  /**
   * @title Interval Minutes
   * @description Check frequency in minutes. Minimum 15.
   */
  intervalMinutes: number;
  /**
   * @title Scope
   * @description What to monitor: one page (default), a whole site, or a Wire action.
   * @default page
   */
  scope?: "page" | "site" | "wire";
  /**
   * @title Watch Mode
   * @description Compare the whole page (default) or only the fields in outputSchema, extracted with AI.
   * @default full_page
   */
  watchMode?: "full_page" | "specific_data";
  /**
   * @title Watch Format
   * @description Format compared in full_page mode.
   * @default markdown
   */
  watchFormat?: "markdown" | "html" | "cleaned_html";
  /**
   * @title Output Schema
   * @description JSON Schema of the fields to track. Required when watchMode is "specific_data".
   */
  outputSchema?: Record<string, unknown>;
  /**
   * @title AI Mode
   * @description AI meaningful-change filtering: ignores trivial noise and summarizes real changes. +1 credit per check.
   * @default false
   */
  aiMode?: boolean;
  /**
   * @title AI Goal
   * @description Natural-language description of which changes count as meaningful (used with aiMode), e.g. "only when the price drops or it goes out of stock".
   */
  aiGoal?: string;
  /**
   * @title Use Browser
   * @description Render checks with a stealth headless browser. Forced true when sessionId is set.
   * @default false
   */
  useBrowser?: boolean;
  /**
   * @title Country
   * @description Two-letter proxy country code.
   * @default us
   */
  country?: string;
  /**
   * @title Session ID
   * @description Saved browser-session ID for monitoring login-protected pages.
   */
  sessionId?: string;
  /**
   * @title Is Active
   * @description Start running immediately.
   * @default true
   */
  isActive?: boolean;
  /**
   * @title Expires At
   * @description Optional end date (ISO 8601 timestamp or YYYY-MM-DD); the monitor auto-pauses when it passes.
   */
  expiresAt?: string;
  /**
   * @title Alert Webhook URL
   * @description Webhook URL that receives signed change alerts.
   */
  alertWebhookUrl?: string;
  /**
   * @title Alert Emails
   * @description Comma-separated email recipients for change alerts.
   */
  alertEmails?: string;
  /**
   * @title Max Pages
   * @description Site scope: max pages crawled per run.
   */
  maxPages?: number;
  /**
   * @title Max Depth
   * @description Site scope: crawl depth (1-5). Defaults to 2.
   */
  maxDepth?: number;
  /**
   * @title Include Patterns
   * @description Site scope: glob patterns or hand-picked same-site URLs to track.
   */
  includePatterns?: string[];
  /**
   * @title Exclude Patterns
   * @description Site scope: glob patterns to skip.
   */
  excludePatterns?: string[];
  /**
   * @title Wire Action ID
   * @description Wire scope (required there): the Wire action run each check, e.g. "amazon.search_products".
   */
  wireActionId?: string;
  /**
   * @title Wire Catalog Slug
   * @description Wire scope: catalog slug of the Wire site.
   */
  wireCatalogSlug?: string;
  /**
   * @title Wire Credential ID
   * @description Wire scope: credential ID when the action needs auth.
   */
  wireCredentialId?: string;
  /**
   * @title Wire Params
   * @description Wire scope: parameters passed to the action each check.
   */
  wireParams?: Record<string, unknown>;
  /**
   * @title Wire Watch Paths
   * @description Wire scope: JSON paths to diff instead of the whole response.
   */
  wireWatchPaths?: string[];
};
