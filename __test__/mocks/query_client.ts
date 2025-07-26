import { MockAccessToken } from "#/mocks/session";

export function MockHeadersWithAccessToken(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

export const MockHeaders = MockHeadersWithAccessToken(MockAccessToken);
