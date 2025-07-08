import { ClaimsRoleEnum, CredentialsRoleEnum } from "@a-novel/connector-authentication/api";
import { SessionContext } from "@a-novel/package-authenticator";

import type { ContextType } from "react";

import { vi } from "vitest";

export const MockAccessToken = "access-token";

export const MockCurrentUser = {
  id: "29f71c01-5ae1-4b01-b729-e17488538e15",
  email: "user@provider.com",
  role: CredentialsRoleEnum.User,
  createdAt: "2025-06-27T14:14:19.442Z",
  updatedAt: "2025-06-27T14:14:19.442Z",
};

export const MockSession: ContextType<typeof SessionContext> = {
  session: {
    claims: {
      userID: MockCurrentUser.id,
      roles: [ClaimsRoleEnum.User],
      refreshTokenID: "",
    },
    accessToken: MockAccessToken,
  },
  setSession: vi.fn(),
  synced: true,
};

export const MockAnonymousSession: ContextType<typeof SessionContext> = {
  session: {
    claims: {
      userID: "",
      roles: [ClaimsRoleEnum.Anon],
      refreshTokenID: "",
    },
    accessToken: MockAccessToken,
  },
  setSession: vi.fn(),
  synced: true,
};

export const MockNoSession: ContextType<typeof SessionContext> = {
  session: {
    accessToken: "",
  },
  setSession: vi.fn(),
  synced: true,
};
