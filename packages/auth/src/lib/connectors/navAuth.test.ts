import { SESSION_SCREEN_CONTEXT_KEY, SESSION_STORAGE_KEY } from "$lib";
import { NavAuthConnector } from "$lib/connectors/index";
import { UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAnon, MockSessionRaw, MockSessionUser } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { setContext } from "svelte";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticationApi, claimsGet, credentialsGet, tokenCreateAnon } from "@a-novel/service-authentication-rest";

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    credentialsGet: vi.fn(),
    tokenCreateAnon: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockTokenCreateAnon = tokenCreateAnon as Mock,
  mockCredentialsGet = credentialsGet as Mock,
  mockClaimsGet = claimsGet as Mock,
  onManageAccount = vi.fn(),
  setScreen = vi.fn();

let manageAccountButton: HTMLButtonElement,
  navAuthRender: ReturnType<typeof render<typeof UITestWrapper>>,
  logoutButton: HTMLButtonElement,
  registerButton: HTMLButtonElement,
  loginButton: HTMLButtonElement,
  user: ReturnType<(typeof userEvent)["setup"]>;

function setupAnon() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

function setupAuth() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));
}

function setupDelayed() {
  mockTokenCreateAnon.mockReturnValueOnce(new Promise((resolve) => setTimeout(() => resolve(MockSessionRaw), 100)));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

async function prepare(mode: "desktop" | "mobile", setup: () => void) {
  user = userEvent.setup();
  setup();

  navAuthRender = render(UITestWrapper, {
    api,
    children: createTestSnippet(
      NavAuthConnector,
      { api, onManageAccount, mobile: mode === "mobile" },
      undefined,
      () => {
        setContext(SESSION_SCREEN_CONTEXT_KEY, { setScreen });
      }
    ),
  });
}

async function waitForAuthComponent(condition?: () => Promise<void>) {
  await waitFor(async () => {
    manageAccountButton = navAuthRender.getByRole("button", { name: /manage account/i }) as HTMLButtonElement;
    logoutButton = navAuthRender.getByRole("button", { name: /logout/i }) as HTMLButtonElement;
    if (condition) {
      await condition();
    }
  });
}

async function waitForAnonComponent() {
  await waitFor(() => {
    registerButton = navAuthRender.getByRole("button", { name: /register/i }) as HTMLButtonElement;
    loginButton = navAuthRender.getByRole("button", { name: /login/i }) as HTMLButtonElement;
  });
}

describe("navAuth Connector", () => {
  for (const mode of ["mobile", "desktop"] as const) {
    describe(`(${mode}) loading session`, () => {
      beforeEach(() => prepare(mode, setupDelayed));

      it("shows nothing while loading session", async () => {
        manageAccountButton = navAuthRender.queryByRole("button", { name: /manage account/i }) as HTMLButtonElement;
        logoutButton = navAuthRender.queryByRole("button", { name: /logout/i }) as HTMLButtonElement;
        registerButton = navAuthRender.queryByRole("button", { name: /register/i }) as HTMLButtonElement;
        loginButton = navAuthRender.queryByRole("button", { name: /login/i }) as HTMLButtonElement;

        expect(manageAccountButton).toBeNull();
        expect(logoutButton).toBeNull();
        expect(registerButton).toBeNull();
        expect(loginButton).toBeNull();
      });

      it("shows component after loading", async () => {
        await waitFor(async () => {
          const loader = navAuthRender.baseElement.querySelector("[aria-busy='true']");
          expect(loader).toBeNull();
        });
      });
    });

    describe(`(${mode}) anon`, () => {
      beforeEach(() => prepare(mode, setupAnon));

      it("shows anon component", async () => {
        await waitForAnonComponent();

        await user.click(registerButton);
        await waitFor(() => {
          expect(setScreen).toHaveBeenCalledWith("register");
        });

        await user.click(loginButton);
        await waitFor(() => {
          expect(setScreen).toHaveBeenCalledWith("login");
        });
      });

      it("does not show auth component", () => {
        manageAccountButton = navAuthRender.queryByRole("button", { name: /manage account/i }) as HTMLButtonElement;
        logoutButton = navAuthRender.queryByRole("button", { name: /logout/i }) as HTMLButtonElement;

        expect(manageAccountButton).toBeNull();
        expect(logoutButton).toBeNull();
      });
    });

    describe(`(${mode}) auth`, () => {
      beforeEach(async () => {
        mockCredentialsGet.mockReturnValueOnce(
          new Promise((resolve) => setTimeout(() => resolve({ email: "john.doe@gmail.com" }), 100))
        );
        await prepare(mode, setupAuth);

        await waitFor(async () => {
          const loader = navAuthRender.baseElement.querySelector("[aria-busy='true']");
          expect(loader).toBeNull();
        });
      });

      it("shows loading state", async () => {
        await waitFor(async () => {
          const loader = navAuthRender.baseElement.querySelector("[aria-busy='true']");
          expect(loader).not.toBeNull();
        });
      });

      it("shows auth component", async () => {
        await waitForAuthComponent(async () => {
          registerButton = navAuthRender.queryByRole("button", { name: /register/i }) as HTMLButtonElement;
          loginButton = navAuthRender.queryByRole("button", { name: /login/i }) as HTMLButtonElement;
          expect(manageAccountButton.innerHTML).toMatch(mode === "mobile" ? /manage/i : /john\.doe.*@gmail\.com/i);
        });

        await fireEvent.click(manageAccountButton);
        await waitFor(() => {
          expect(onManageAccount).toHaveBeenCalled();
        });

        await fireEvent.click(logoutButton);
        await waitFor(() => {
          expect(mockTokenCreateAnon).toHaveBeenCalled();
          expect(mockClaimsGet).toHaveBeenCalled();
        });

        await waitForAnonComponent();
        expect(registerButton).not.toBeNull();
        expect(loginButton).not.toBeNull();
      });
    });
  }
});
