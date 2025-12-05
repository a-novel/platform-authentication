import { getContext } from "svelte";

import { type Claims, ClaimsSchema, type TokenCreateRequest } from "@a-novel/service-authentication-rest";

import { z } from "zod";

export const SESSION_STORAGE_KEY = "a-novel-session";

export const SessionSchema = z.object({
  claims: ClaimsSchema.optional(),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;

export interface SessionContext {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly claims: Claims | undefined;
  resetSession(): Promise<{ accessToken: string; refreshToken?: string | undefined }>;
  refreshClaims(): Promise<void>;
  retrySession<R>(callback: (accessToken: string) => Promise<R>): (accessToken: string) => Promise<R>;
  authenticate(data: TokenCreateRequest): Promise<void>;
}

export function getSession(): SessionContext {
  return getContext<SessionContext>(SESSION_STORAGE_KEY);
}
