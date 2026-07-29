export type WireLoginInput = {
  /**
   * @title Catalog Slug
   * @description The catalog to sign in to (e.g. "neb").
   */
  catalog_slug: string;
  /**
   * @title Params
   * @description Login fields defined by the catalog (e.g. { email, password }). Use Wire: Browse Catalog's login_input_schema to learn the field names.
   */
  params?: Record<string, unknown>;
  /**
   * @title Identity Name
   * @description Optional name for the identity. Derived from params in password mode; required when using a 1Password locator.
   */
  identity_name?: string;
  /**
   * @title Source ID
   * @description Optional 1Password identity-source ID (alternative to params).
   */
  source_id?: string;
  /**
   * @title Source Ref
   * @description Optional 1Password item locator { vault_id, item_id, fields } (use with source_id instead of params).
   */
  source_ref?: Record<string, unknown>;
};
