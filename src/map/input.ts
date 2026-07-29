export type MapInput = {
  /**
   * @title URL
   * @description The starting URL for discovery (typically a homepage or section root).
   */
  url: string;
  /**
   * @title Limit
   * @description Maximum number of URLs to return overall.
   * @default 100
   */
  limit?: number;
  /**
   * @title Depth
   * @description How many link-hops from the starting URL to follow.
   * @default 2
   */
  depth?: number;
  /**
   * @title Limit Per Level
   * @description Maximum URLs collected per depth level (controls breadth).
   * @default 100
   */
  limitPerLevel?: number;
  /**
   * @title Include Subdomains
   * @description Include URLs on subdomains of the starting host.
   * @default false
   */
  includeSubdomains?: boolean;
  /**
   * @title Include External Links
   * @description Also collect (but do not follow) external links.
   * @default false
   */
  includeExternalLinks?: boolean;
  /**
   * @title Use Browser
   * @description Render with a headless browser — best for JS-heavy sites (SPAs).
   * @default false
   */
  useBrowser?: boolean;
  /**
   * @title Search
   * @description Optional keyword filter — only return URLs whose path/title matches.
   */
  search?: string;
};
