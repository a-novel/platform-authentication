import { SESSION_SCREEN_CONTEXT_KEY, SESSION_STORAGE_KEY } from "$lib";
import { RegisterPageConnector } from "$lib/connectors/index";
import { UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAnon, MockSessionRaw } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { setContext } from "svelte";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@a-novel-kit/nodelib-browser/http";
import {
  AuthenticationApi,
  Lang,
  claimsGet,
  shortCodeCreateRegister,
  tokenCreateAnon,
} from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    tokenCreateAnon: vi.fn(),
    shortCodeCreateRegister: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockTokenCreateAnon = tokenCreateAnon as Mock,
  mockShortCodeCreateRegister = shortCodeCreateRegister as Mock,
  mockClaimsGet = claimsGet as Mock,
  setScreen = vi.fn();

let submitButton: HTMLButtonElement,
  registerPage: ReturnType<typeof render<typeof UITestWrapper>>,
  emailField: HTMLInputElement,
  user: ReturnType<(typeof userEvent)["setup"]>;

function setupBase() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

function setupDelayed() {
  mockTokenCreateAnon.mockReturnValueOnce(new Promise((resolve) => setTimeout(() => resolve(MockSessionRaw), 100)));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

async function prepare(setup: () => void) {
  user = userEvent.setup();
  setup();

  registerPage = render(UITestWrapper, {
    api,
    children: createTestSnippet(RegisterPageConnector, { api }, undefined, () => {
      setContext(SESSION_SCREEN_CONTEXT_KEY, { setScreen });
    }),
  });

  // Wait for the form element to be rendered.
  await waitFor(() => {
    const form = registerPage.queryByRole("form", {
      name: /register form/i,
    });
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });

  submitButton = registerPage.queryByRole("button", { name: /start registration/i }) as HTMLButtonElement;
  emailField = registerPage.getByLabelText(/email/i) as HTMLInputElement;

  expect(submitButton).toBeDefined();
  expect(submitButton).not.toBeNull();
  expect(emailField).toBeDefined();
  expect(emailField).not.toBeNull();
}

describe("register page", () => {
  describe("submit button", () => {
    beforeEach(() => prepare(setupDelayed));

    it("is enabled", async () => {
      await waitFor(() => {
        expect(submitButton.disabled).toBeFalsy();
      });
    });
  });

  describe("submit", () => {
    beforeEach(() => prepare(setupBase));

    it("does not submit while fields are invalid", async () => {
      // Fields empty.
      await user.click(submitButton);
      expect(mockShortCodeCreateRegister).not.toHaveBeenCalled();

      // Email filled but invalid.
      await user.clear(emailField);
      await user.type(emailField, "john.doe");
      await waitFor(() => {
        expect(emailField.dataset.status).toBe("idle");
      });

      await user.click(submitButton);
      expect(mockShortCodeCreateRegister).not.toHaveBeenCalled();
    });

    it("reports success", async () => {
      await user.type(emailField, "john.doe@gmail.com");

      mockShortCodeCreateRegister.mockReturnValueOnce(Promise.resolve());

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShortCodeCreateRegister).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
          email: "john.doe@gmail.com",
          lang: Lang.En,
        });
      });

      await waitFor(() => {
        const registerSuccessModal = registerPage.queryByText(/registration form created/i);
        expect(registerSuccessModal).toBeDefined();
        expect(registerSuccessModal).not.toBeNull();
      });

      const loginButton = registerPage.getByRole("button", { name: /login/i }) as HTMLButtonElement;
      expect(loginButton).toBeDefined();
      expect(loginButton).not.toBeNull();

      await user.click(loginButton);

      await waitFor(() => {
        expect(setScreen).toHaveBeenCalledExactlyOnceWith("login");
      });
    });

    describe("on error", () => {
      it("reports email already taken", async () => {
        await user.type(emailField, "john.doe@gmail.com");

        mockShortCodeCreateRegister.mockImplementationOnce(async () => {
          throw new HttpError(409, "email taken");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockShortCodeCreateRegister).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email: "john.doe@gmail.com",
            lang: Lang.En,
          });
          expect(emailField.dataset.status).toBe("invalid");
        });

        const errorMessage = registerPage.queryByText(/an account with this email already exists/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        expect(setScreen).not.toHaveBeenCalled();
      });

      it("reports any error", async () => {
        await user.type(emailField, "john.doe@gmail.com");

        mockShortCodeCreateRegister.mockImplementationOnce(async () => {
          throw new HttpError(500, "ouh la la");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockShortCodeCreateRegister).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email: "john.doe@gmail.com",
            lang: Lang.En,
          });
        });

        const errorMessage = registerPage.queryByText(/an unknown error occurred during registration form creation/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        expect(setScreen).not.toHaveBeenCalled();
      });
    });
  });

  describe("actions", () => {
    beforeEach(() => prepare(setupBase));

    it("goes to login screen", async () => {
      const registerButton = registerPage.getByRole("button", { name: /login/i });
      expect(registerButton).toBeDefined();
      expect(registerButton).not.toBeNull();

      await user.click(registerButton);

      await waitFor(() => {
        expect(setScreen).toHaveBeenCalledExactlyOnceWith("login");
      });
    });
  });
});
