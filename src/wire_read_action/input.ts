export type WireReadActionInput = {
  /**
   * @title Action ID
   * @description The action to run (from Wire: Discover Actions / Wire: Browse Catalog).
   */
  action_id: string;
  /**
   * @title Params
   * @description The action's input parameters. Shape depends on the action — use its parameter schema from discovery. Omit for actions that take none.
   */
  params?: Record<string, unknown>;
  /**
   * @title Credential ID
   * @description Required when the action's auth_mode is "required"; honored when "optional"; ignored when "none". Get one from Wire: List Identities or Wire: Sign In.
   */
  credential_id?: string;
  /**
   * @title Identity ID
   * @description Optional identity selector — the server resolves a credential from it (alternative to credential_id).
   */
  identity_id?: string;
};
