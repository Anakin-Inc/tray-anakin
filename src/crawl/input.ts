export type CrawlInput = {
  /**
   * @title URL
   * @description Starting URL.
   */
  url: string;
  /**
   * @title Max Pages
   * @description Hard cap on pages fetched.
   * @default 10
   */
  maxPages?: number;
  /**
   * @title Depth
   * @description Link-hops from the starting URL to follow.
   * @default 1
   */
  depth?: number;
  /**
   * @title Country
   * @description Proxy country code, e.g. us, gb, de.
   * @default us
   */
  country?: string;
  /**
   * @title Use Browser
   * @description Render each page in a headless browser — best for JS-heavy sites.
   * @default false
   */
  useBrowser?: boolean;
  /**
   * @title Include Patterns
   * @description Glob/regex patterns. Only URLs matching at least one pattern are fetched.
   */
  includePatterns?: string[];
  /**
   * @title Exclude Patterns
   * @description Glob/regex patterns. URLs matching any pattern are skipped.
   */
  excludePatterns?: string[];
  /**
   * @title Session ID
   * @description Reuse a previously saved browser session (see Anakin's session dashboard) for login-protected sites.
   */
  sessionId?: string;
  /**
   * @title Session Name
   * @description Same as Session ID, but looked up by name instead of ID.
   */
  sessionName?: string;
};
