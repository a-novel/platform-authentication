import { MockSession } from "#/mocks/session";

import { newAgoraPwFixture } from "@a-novel/nodelib/test/e2e";
import { SESSION_STORAGE_KEY } from "@a-novel/package-authenticator";

import { type BrowserContextOptions } from "@playwright/test";

export const AuthenticatedStorageState = (baseURL: string): BrowserContextOptions["storageState"] => ({
  cookies: [],
  origins: [
    {
      origin: baseURL,
      localStorage: [{ name: SESSION_STORAGE_KEY, value: JSON.stringify(MockSession.session) }],
    },
  ],
});

export const test = newAgoraPwFixture({
  coverage: { include: ["/src/**/*.{ts,tsx}"] },
});

export const expect = test.expect;
