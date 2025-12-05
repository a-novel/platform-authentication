import { ProtectedPage, SESSION_STORAGE_KEY, SessionUiComponent } from "$lib";
import { UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAdmin, MockSessionAnon, MockSessionRaw, MockSessionUser } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { createRawSnippet } from "svelte";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticationApi, Role, claimsGet } from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockClaimsGet = claimsGet as Mock;

let renderUi: ReturnType<typeof render<typeof UITestWrapper>>;

function setupAnon() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

function setupAuth() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));
}

function setupAdmin() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAdmin));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAdmin.claims));
}

function setupDelayed() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionRaw));
  mockClaimsGet.mockReturnValue(new Promise((resolve) => setTimeout(() => resolve(MockSessionUser.claims), 100)));
}

async function prepare(setup: () => void, roles?: string[]) {
  setup();

  const children = createRawSnippet(() => ({
    render: () => `<div>Bonjour</div>`,
  }));

  renderUi = render(UITestWrapper, {
    api,
    children: createTestSnippet(SessionUiComponent, {
      api,
      children: createTestSnippet(ProtectedPage, { children, roles }),
    }),
  });
}

describe("protected page", () => {
  describe("render", () => {
    beforeEach(() => prepare(setupDelayed));

    it("shows loading initially", async () => {
      await waitFor(() => {
        const loading = renderUi.getByText(/loading user session/i);
        expect(loading).toBeInTheDocument();

        const content = renderUi.queryByText(/bonjour/i);
        expect(content).toBeNull();
      });
    });

    it("shows content when loaded", async () => {
      await waitFor(() => {
        const content = renderUi.getByText(/bonjour/i);
        expect(content).toBeInTheDocument();

        const loading = renderUi.queryByText(/loading user session/i);
        expect(loading).toBeNull();
      });
    });
  });

  it("shows login on anon", async () => {
    await prepare(setupAnon);

    await waitFor(() => {
      const form = renderUi.queryByRole("form", {
        name: /login/i,
      });
      expect(form).toBeDefined();
      expect(form).not.toBeNull();
    });

    expect(renderUi.queryByText(/bonjour/i)).toBeNull();
  });

  it("shows login on anon with permissions", async () => {
    await prepare(setupAnon, [Role.Admin]);

    await waitFor(() => {
      const form = renderUi.queryByRole("form", {
        name: /login/i,
      });
      expect(form).toBeDefined();
      expect(form).not.toBeNull();
    });

    expect(renderUi.queryByText(/bonjour/i)).toBeNull();
  });

  it("shows forbidden on insufficient roles", async () => {
    await prepare(setupAuth, [Role.Admin]);

    await waitFor(() => {
      const forbidden = renderUi.getByText(/access forbidden/i);
      expect(forbidden).toBeInTheDocument();
      expect(renderUi.queryByText(/bonjour/i)).toBeNull();
    });
  });

  it("shows content on sufficient roles", async () => {
    await prepare(setupAdmin, [Role.Admin]);

    await waitFor(() => {
      const content = renderUi.getByText(/bonjour/i);
      expect(content).toBeInTheDocument();

      const forbidden = renderUi.queryByText(/access forbidden/i);
      expect(forbidden).toBeNull();
    });
  });
});
