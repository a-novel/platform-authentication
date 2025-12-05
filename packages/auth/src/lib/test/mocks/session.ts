import { SessionSchema } from "$lib/index.js";

import { Role } from "@a-novel/service-authentication-rest";

import { z } from "zod";

export const MockSessionRaw = {
  accessToken: "mock-raw-access-token",
  refreshToken: "mock-raw-refresh-token",
} satisfies z.infer<typeof SessionSchema>;

export const MockSessionAnon = {
  accessToken: "mock-anon-access-token",
  refreshToken: "mock-anon-refresh-token",
  claims: {
    roles: [Role.Anon],
  },
} satisfies z.infer<typeof SessionSchema>;

export const MockSessionUser = {
  accessToken: "mock-user-access-token",
  refreshToken: "mock-user-refresh-token",
  claims: {
    roles: [Role.User],
    userID: "ef1943c5-c506-49b5-bfa7-16fcd270e9ce",
    refreshTokenID: "78f4016c-c964-4260-9e14-9be37eabb365",
  },
} satisfies z.infer<typeof SessionSchema>;

export const MockSessionAdmin = {
  accessToken: "mock-admin-access-token",
  refreshToken: "mock-admin-refresh-token",
  claims: {
    roles: [Role.Admin],
    userID: "cf95d367-31b2-431c-b1d8-8baa554dad46",
    refreshTokenID: "d69c1a0c-a3e0-4f6a-844d-753753334474",
  },
} satisfies z.infer<typeof SessionSchema>;

export const MockSessionSuperAdmin = {
  accessToken: "mock-superadmin-access-token",
  refreshToken: "mock-superadmin-refresh-token",
  claims: {
    roles: [Role.SuperAdmin],
    userID: "1978253a-93c4-4bd3-9ef7-0cd10a2e9be7",
    refreshTokenID: "a6cc4e0f-d567-4b84-b324-dc3d0c5cc5ab",
  },
} satisfies z.infer<typeof SessionSchema>;
