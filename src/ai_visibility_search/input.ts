export type AiVisibilitySearchInput = {
  /**
   * @title Query
   * @description The question to ask every engine (max 2000 characters).
   */
  query: string;
  /**
   * @title Sources
   * @description Engine slugs to query (see AI Visibility: List Sources). Omit to query all enabled engines.
   */
  sources?: string[];
  /**
   * @title Country
   * @description Two-letter ISO country for the search geography (proxy exit).
   * @default us
   */
  country?: string;
};
