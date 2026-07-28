export type UrlScraperInput = {
  /**
   * @title URL
   * @description The full URL of the page to scrape.
   */
  url: string;
  /**
   * @title Country
   * @description Proxy country code, e.g. us, gb, de.
   * @default us
   */
  country?: string;
  /**
   * @title Use Browser
   * @description Use a headless browser — best for JS-heavy sites.
   * @default false
   */
  useBrowser?: boolean;
  /**
   * @title Generate JSON
   * @description AI-extract structured JSON from the page content in addition to markdown.
   * @default false
   */
  generateJson?: boolean;
  /**
   * @title Force Fresh
   * @description Bypass the cache and force a fresh extraction.
   * @default false
   */
  forceFresh?: boolean;
  /**
   * @title Session ID
   * @description Reuse a previously saved browser session (see Anakin's session dashboard) instead of a fresh anonymous browser context.
   */
  sessionId?: string;
  /**
   * @title Session Name
   * @description Same as Session ID, but looked up by name instead of ID.
   */
  sessionName?: string;
};
