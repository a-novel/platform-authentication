import { SESSION_STORAGE_KEY, type SessionContext, getSession } from "$lib";
import { TestComponent, UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAdmin, MockSessionAnon, MockSessionRaw, MockSessionUser } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@a-novel-kit/nodelib-browser/http";
import {
  AuthenticationApi,
  claimsGet,
  tokenCreate,
  tokenCreateAnon,
  tokenRefresh,
} from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    claimsGet: vi.fn(),
    tokenCreate: vi.fn(),
    tokenCreateAnon: vi.fn(),
    tokenRefresh: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockTokenCreate = tokenCreate as Mock,
  mockTokenCreateAnon = tokenCreateAnon as Mock,
  mockClaimsGet = claimsGet as Mock,
  mockTokenRefresh = tokenRefresh as Mock;

let session: SessionContext, rendered: ReturnType<typeof render<typeof UITestWrapper>>;

async function prepare(setup?: () => void) {
  setup?.();

  const testCallback = () => {
    session = getSession();
  };

  rendered = render(UITestWrapper, {
    api,
    children: createTestSnippet(TestComponent, { callback: testCallback }, () => `<div>Bonjour</div>`),
  });

  await waitFor(() => {
    expect(session).toBeDefined();
  });
}

describe("session", () => {
  describe("init", () => {
    it("loads from local storage", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
      // Claims are synced anyway.
      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAdmin.claims));

      await prepare();

      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionUser.accessToken);
        expect(session.refreshToken).toEqual(MockSessionUser.refreshToken);
        expect(session.claims).toEqual(MockSessionAdmin.claims);
      });

      expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();
      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken);
    });

    it("loads from incomplete local storage", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionRaw));
      // Claims are synced anyway.
      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAdmin.claims));

      await prepare();

      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionRaw.accessToken);
        expect(session.refreshToken).toEqual(MockSessionRaw.refreshToken);
        expect(session.claims).toEqual(MockSessionAdmin.claims);
      });

      expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();
      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionRaw.accessToken);
    });

    it("loads from api", async () => {
      mockTokenCreateAnon.mockReturnValueOnce(Promise.resolve(MockSessionAnon));
      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));

      await prepare();

      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionAnon.accessToken);
        expect(session.refreshToken).toEqual(MockSessionAnon.refreshToken);
        expect(session.claims).toEqual(MockSessionAnon.claims);
      });

      expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();
      expect(mockTokenCreateAnon).toHaveBeenCalledExactlyOnceWith(api);
      expect(mockClaimsGet).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken);
    });

    it("refreshes expired tokens", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
      // Claims are synced anyway.
      mockClaimsGet.mockImplementationOnce(async () => {
        throw new HttpError(401, "blah blah blah");
      });
      mockTokenRefresh.mockReturnValueOnce(
        Promise.resolve({
          accessToken: "new-mock-user-access-token",
          refreshToken: "mock-user-refresh-token",
        })
      );
      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAdmin.claims));

      await prepare();

      await waitFor(() => {
        expect(session.accessToken).toEqual("new-mock-user-access-token");
        expect(session.refreshToken).toEqual(MockSessionUser.refreshToken);
        expect(session.claims).toEqual(MockSessionAdmin.claims);
      });

      expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();

      expect(mockClaimsGet).toHaveBeenNthCalledWith(1, api, MockSessionUser.accessToken);
      expect(mockTokenRefresh).toHaveBeenCalledExactlyOnceWith(api, {
        accessToken: MockSessionUser.accessToken,
        refreshToken: MockSessionUser.refreshToken,
      });
      expect(mockClaimsGet).toHaveBeenNthCalledWith(2, api, "new-mock-user-access-token");
    });

    it("resets invalid session", async () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
      // Claims are synced anyway.
      mockClaimsGet
        .mockImplementationOnce(async () => {
          throw new HttpError(401, "blah blah blah");
        })
        .mockImplementationOnce(async () => {
          return MockSessionAnon.claims;
        });
      mockTokenRefresh.mockImplementationOnce(async () => {
        throw new HttpError(403, "blah blah blah");
      });
      mockTokenCreateAnon.mockReturnValueOnce(Promise.resolve(MockSessionAnon));

      await prepare();

      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionAnon.accessToken);
        expect(session.refreshToken).toEqual(MockSessionAnon.refreshToken);
        expect(session.claims).toEqual(MockSessionAnon.claims);
      });

      expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();

      expect(mockClaimsGet).toHaveBeenNthCalledWith(1, api, MockSessionUser.accessToken);
      expect(mockTokenRefresh).toHaveBeenCalledExactlyOnceWith(api, {
        accessToken: MockSessionUser.accessToken,
        refreshToken: MockSessionUser.refreshToken,
      });
      expect(mockTokenCreateAnon).toHaveBeenCalledExactlyOnceWith(api);
      expect(mockClaimsGet).toHaveBeenNthCalledWith(2, api, MockSessionAnon.accessToken);
    });

    it("catches error", async () => {
      mockTokenCreateAnon.mockImplementation(() => {
        throw new Error("ouh la la");
      });

      await prepare();

      await waitFor(
        () => {
          expect(rendered.queryByText(/bonjour/i)).toBeNull();
          expect(rendered.getByText(/ouh la la/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe("mutate", () => {
    beforeEach(() =>
      prepare(() => {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
        mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));
      })
    );

    it("resets session", async () => {
      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionUser.accessToken);
        expect(session.refreshToken).toEqual(MockSessionUser.refreshToken);
        expect(session.claims).toEqual(MockSessionUser.claims);
      });

      mockTokenCreateAnon.mockReturnValueOnce(Promise.resolve(MockSessionAnon));
      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));

      await session.resetSession();

      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionAnon.accessToken);
        expect(session.refreshToken).toEqual(MockSessionAnon.refreshToken);
        expect(session.claims).toEqual(MockSessionAnon.claims);
      });

      expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();
    });

    it("refreshes claims", async () => {
      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionUser.accessToken);
        expect(session.refreshToken).toEqual(MockSessionUser.refreshToken);
        expect(session.claims).toEqual(MockSessionUser.claims);
      });

      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAdmin.claims));

      await session.refreshClaims();

      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionUser.accessToken);
        expect(session.refreshToken).toEqual(MockSessionUser.refreshToken);
        expect(session.claims).toEqual(MockSessionAdmin.claims);
      });

      expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();
    });

    it("authenticates", async () => {
      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionUser.accessToken);
        expect(session.refreshToken).toEqual(MockSessionUser.refreshToken);
        expect(session.claims).toEqual(MockSessionUser.claims);
      });

      mockTokenCreate.mockReturnValueOnce(Promise.resolve(MockSessionAdmin));
      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAdmin.claims));

      await session.authenticate({ email: "admin@email.com", password: "password" });
      await waitFor(() => {
        expect(session.accessToken).toEqual(MockSessionAdmin.accessToken);
        expect(session.refreshToken).toEqual(MockSessionAdmin.refreshToken);
        expect(session.claims).toEqual(MockSessionAdmin.claims);
      });

      await expect(rendered.getByText(/bonjour/i)).toBeInTheDocument();
    });
  });
});
