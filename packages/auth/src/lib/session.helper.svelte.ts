import { getContext } from "svelte";

import { type Claims, ClaimsSchema, type TokenCreateRequest } from "@a-novel/service-authentication-rest";

import { z } from "zod";

export const SESSION_STORAGE_KEY = "a-novel-session";

export const SessionSchema = z.object({
  claims: ClaimsSchema.optional(),
  accessToken: z.string(),
  refreshToken: z.string(),
});

/**
 * Active user session.
 */
export type Session = z.infer<typeof SessionSchema>;

export interface SessionContext {
  /**
   * Active access token used to authenticate requests.
   */
  readonly accessToken: string;
  /**
   * Active refresh token used to refresh the access token when needed.
   * Once this token expires, user must re-authenticate.
   */
  readonly refreshToken: string;
  /**
   * Decoded claims from the access token.
   */
  readonly claims: Claims | undefined;
  /**
   * Resets the current session by obtaining brand-new tokens. If the user was
   * authenticated, it will switch to an anonymous session.
   */
  resetSession(): Promise<{ accessToken: string; refreshToken?: string | undefined }>;
  /**
   * Refreshes the claims from the access token.
   */
  refreshClaims(): Promise<void>;
  /**
   * Retries the given callback, refreshing the session if needed.
   */
  retrySession<R>(callback: (accessToken: string) => Promise<R>): (accessToken: string) => Promise<R>;
  /**
   * Authenticates the session with the given credentials. If user was anonymous,
   * it will switch to an authenticated session.
   */
  authenticate(data: TokenCreateRequest): Promise<void>;
}

export function getSession(): SessionContext {
  return getContext<SessionContext>(SESSION_STORAGE_KEY);
}
