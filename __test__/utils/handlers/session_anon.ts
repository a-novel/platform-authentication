import { MockHeadersWithAccessToken } from "#/mocks/query_client";
import { MockCurrentUser, MockSession } from "#/mocks/session";

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

export const sessionAuthenticatedHandlers = [
  http
    .get("http://service.auth.test/session")
    .headers(new Headers(MockHeadersWithAccessToken(MockSession.session!.accessToken!)), HttpResponse.error())
    .resolve(() => HttpResponse.json({ userID: "94b4d288-dbff-4eca-805a-f45311a34e15", roles: ["auth:user"] })),
  http
    .get("http://service.auth.test/user")
    .headers(new Headers(MockHeadersWithAccessToken(MockSession.session!.accessToken!)), HttpResponse.error())
    .searchParams(new URLSearchParams({ userID: MockSession.session!.claims!.userID! }), true, HttpResponse.error())
    .resolve(() => HttpResponse.json(MockCurrentUser)),
];
