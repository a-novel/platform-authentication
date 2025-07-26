import { ClaimsRoleEnum, CredentialsRoleEnum } from "@a-novel/connector-authentication/api";
import { SessionContext } from "@a-novel/package-authenticator";

import type { ContextType } from "react";

export const MockAccessToken = "access-token";

export const MockCurrentUser = {
  id: "94b4d288-dbff-4eca-805a-f45311a34e15",
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
  setSession: () => {},
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
  setSession: () => {},
  synced: true,
};

export const MockNoSession: ContextType<typeof SessionContext> = {
  session: {
    accessToken: "",
  },
  setSession: () => {},
  synced: true,
};
