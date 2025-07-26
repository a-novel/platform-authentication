import { MockHeadersWithAccessToken } from "#/mocks/query_client";

import { http } from "@a-novel/nodelib/msw";

import { HttpResponse } from "msw";

export const sessionAnonHandlers = [
  http
    .put("http://service.auth.test/session/anon")
    .resolve(() => HttpResponse.json({ accessToken: "anon-access-token" })),
  http
    .get("http://service.auth.test/session")
    .headers(new Headers(MockHeadersWithAccessToken("anon-access-token")), HttpResponse.error())
    .resolve(() => HttpResponse.json({ roles: ["auth:anon"] })),
];
