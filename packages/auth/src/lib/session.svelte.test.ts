import { HttpError } from "@a-novel/nodelib-browser/http";
import { AuthenticationApi, claimsGet, tokenCreateAnon, tokenRefresh } from "@a-novel/service-authentication-rest";

import { getSession, SESSION_STORAGE_KEY, SessionComponent, SessionStore } from "$lib/index.js";
import { createTestSnippet, TestComponent } from "$lib/test/index.js";
import { MockSessionAnon, MockSessionRaw, MockSessionUser } from "$lib/test/mocks/session.js";
import "$lib/test/setup/base.js";
import { render, waitFor } from "@testing-library/svelte";
import type { Snippet } from "svelte";
import { describe, expect, it, type Mock, vi } from "vitest";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    tokenCreateAnon: vi.fn(),
    tokenRefresh: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockTokenCreateAnon = tokenCreateAnon as Mock;
const mockTokenRefresh = tokenRefresh as Mock;
const mockClaimsGet = claimsGet as Mock;

function renderSession(wrapper?: (children: Snippet) => Snippet) {
  const sessionRef = {
    session: null as SessionStore | null,
  };

  const testCallback = () => {
    sessionRef.session = getSession();
  };

  const testSnippet = createTestSnippet(TestComponent, { callback: testCallback }, () => `<div>Loaded!</div>`);

  const rendered = render(SessionComponent, { api, children: wrapper ? wrapper(testSnippet) : testSnippet });

  return Object.assign(sessionRef, { rendered });
}

describe("SessionSchema Component", () => {
  describe("loads session", () => {
    it("from local storage", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));

      const sessionRender = renderSession();

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual(MockSessionUser);
      });
    });

    it("reuses session if already init", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
      const localStorageSpy = vi.spyOn(Storage.prototype, "getItem");

      const innerSessionRender = (children: Snippet) => createTestSnippet(SessionComponent, { api, children });
      const sessionRender = renderSession(innerSessionRender);

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual(MockSessionUser);
      });

      expect(localStorageSpy).toHaveBeenCalledTimes(1);
    });

    it("from api if there is no session in local storage", async () => {
      mockTokenCreateAnon.mockReturnValue(Promise.resolve(MockSessionRaw));
      mockClaimsGet.mockReturnValue(Promise.resolve(MockSessionAnon.claims));

      const sessionRender = renderSession();

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual({
          ...MockSessionRaw,
          claims: MockSessionAnon.claims,
        });
      });

      expect(mockTokenCreateAnon).toHaveBeenCalledExactlyOnceWith(api);
      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionRaw.accessToken);
    });

    it("from local storage and api if local session is incomplete", async () => {
      mockClaimsGet.mockReturnValue(Promise.resolve(MockSessionAnon.claims));

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionRaw));

      const sessionRender = renderSession();

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual({
          ...MockSessionRaw,
          claims: MockSessionAnon.claims,
        });
      });

      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionRaw.accessToken);
    });

    it("from local storage and fallback to api if local session is malformed", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ accessToken: 123 }));

      mockTokenCreateAnon.mockReturnValue(Promise.resolve(MockSessionRaw));
      mockClaimsGet.mockReturnValue(Promise.resolve(MockSessionAnon.claims));

      vi.spyOn(console, "warn").mockImplementation(() => {});

      const sessionRender = renderSession();

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual({
          ...MockSessionRaw,
          claims: MockSessionAnon.claims,
        });
      });

      expect(console.warn).toHaveBeenCalledOnce();
      expect(mockTokenCreateAnon).toHaveBeenCalledExactlyOnceWith(api);
      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionRaw.accessToken);
    });

    it("from local storage and refreshes using api if local session is expired", async () => {
      mockClaimsGet
        .mockImplementationOnce(async () => {
          throw new HttpError(401, "");
        })
        .mockImplementationOnce(async () => {
          return MockSessionUser.claims;
        });
      mockTokenRefresh.mockReturnValue(
        Promise.resolve({
          accessToken: MockSessionUser.accessToken,
          refreshToken: MockSessionUser.refreshToken,
        })
      );

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionRaw));

      const sessionRender = renderSession();

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual(MockSessionUser);
      });

      expect(mockClaimsGet).toHaveBeenNthCalledWith(1, api, MockSessionRaw.accessToken);
      expect(mockClaimsGet).toHaveBeenNthCalledWith(2, api, MockSessionUser.accessToken);
      expect(mockTokenRefresh).toHaveBeenCalledExactlyOnceWith(api, {
        accessToken: MockSessionRaw.accessToken,
        refreshToken: MockSessionRaw.refreshToken,
      });
    });
  });

  describe("mutating session", () => {
    it("opens a new anonymous session when logged out", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));

      const sessionRender = renderSession();

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual(MockSessionUser);
      });

      mockTokenCreateAnon.mockReturnValue(Promise.resolve(MockSessionAnon));
      mockClaimsGet.mockReturnValue(Promise.resolve(MockSessionAnon.claims));

      sessionRender.session!.clear();

      await waitFor(() => {
        expect(sessionRender.session?.current).toEqual(MockSessionAnon);
      });

      expect(mockTokenCreateAnon).toHaveBeenCalledExactlyOnceWith(api);
      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken);
    });

    it("refetches claims when session is updated raw", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));

      const sessionRender = renderSession();

      await waitFor(() => {
        expect(sessionRender.session).toBeDefined();
        expect(sessionRender.session).not.toBeNull();
        expect(sessionRender.session?.current).toEqual(MockSessionAnon);
      });

      mockClaimsGet.mockReturnValue(Promise.resolve(MockSessionUser.claims));

      sessionRender.session!.current = {
        accessToken: MockSessionUser.accessToken,
        refreshToken: MockSessionUser.refreshToken,
      };

      await waitFor(() => {
        expect(sessionRender.session?.current).toEqual(MockSessionUser);
      });

      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken);
    });
  });
});
