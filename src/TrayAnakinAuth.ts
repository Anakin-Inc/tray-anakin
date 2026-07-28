import { TokenOperationHandlerAuth } from "@trayio/cdk-dsl/connector/operation/OperationHandler";

// Anakin uses a single static per-account API key (get one free, no card
// required, at https://anakin.io/dashboard) — no OAuth handshake, no app-level
// client id/secret. TOKEN is the CDK auth type for exactly this shape: a
// single user-supplied credential, set once when the user connects the
// authentication in the Tray builder. See src/GlobalConfig.ts for how the
// key is attached to every request (as the `X-API-Key` header, not a Bearer
// token — Anakin's API does not use the `Authorization` header).
export type UserAuth = {
  api_key: string;
};

export type AppAuth = {};

export type TrayAnakinAuth = TokenOperationHandlerAuth<UserAuth, AppAuth>;
