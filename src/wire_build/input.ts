export type WireBuildInput = {
  /**
   * @title Website URL
   * @description The site to build an action for. The domain is extracted automatically.
   */
  website_url: string;
  /**
   * @title Goal
   * @description Natural-language description of what the action should do or extract. Be specific — the builder synthesizes the scraper from this.
   */
  goal: string;
  /**
   * @title Catalog ID
   * @description Optional — attach to an existing catalog instead of creating one.
   */
  catalog_id?: string;
  /**
   * @title Visibility
   * @description Action visibility.
   * @default private
   */
  visibility?: "private" | "public";
  /**
   * @title Force
   * @description Build even if similar actions already exist for the domain (otherwise the request is rejected with ACTION_EXISTS).
   * @default false
   */
  force?: boolean;
};
