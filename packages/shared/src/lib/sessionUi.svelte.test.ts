import { SESSION_STORAGE_KEY, type SessionScreenContext, SessionUiComponent, getSessionScreen } from "$lib";
import { TestComponent, UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAnon } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticationApi, claimsGet } from "@a-novel/service-authentication-rest";

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

let sessionUiRender: ReturnType<typeof render<typeof UITestWrapper>>, screenContext: SessionScreenContext;

function setupAnon() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

async function prepare(setup: () => void) {
  setup();

  function testCallback() {
    screenContext = getSessionScreen();
  }

  const children = createTestSnippet(TestComponent, { callback: testCallback }, () => `<div>Bonjour</div>`);

  sessionUiRender = render(UITestWrapper, {
    api,
    children: createTestSnippet(SessionUiComponent, { api, children }),
  });

  await waitFor(() => {
    expect(screenContext).toBeDefined();
  });
}

describe("session ui", () => {
  beforeEach(() => prepare(setupAnon));

  it("shows children by default", async () => {
    await waitFor(() => {
      expect(sessionUiRender.getByText(/bonjour/i)).toBeInTheDocument();
    });
  });

  it("shows login screen", async () => {
    screenContext.setScreen("login");

    await waitFor(() => {
      const form = sessionUiRender.queryByRole("form", {
        name: /login/i,
      });
      expect(form).toBeDefined();
      expect(form).not.toBeNull();
    });

    expect(sessionUiRender.queryByText(/bonjour/i)).toBeNull();
  });

  it("shows register screen", async () => {
    screenContext.setScreen("register");

    await waitFor(() => {
      const form = sessionUiRender.queryByRole("form", {
        name: /register/i,
      });
      expect(form).toBeDefined();
      expect(form).not.toBeNull();
    });

    expect(sessionUiRender.queryByText(/bonjour/i)).toBeNull();
  });

  it("shows password reset screen", async () => {
    screenContext.setScreen("passwordReset");

    await waitFor(() => {
      const form = sessionUiRender.queryByRole("form", {
        name: /password-reset/i,
      });
      expect(form).toBeDefined();
      expect(form).not.toBeNull();
    });

    expect(sessionUiRender.queryByText(/bonjour/i)).toBeNull();
  });
});
