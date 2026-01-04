import { SESSION_SCREEN_CONTEXT_KEY, SESSION_STORAGE_KEY } from "$lib";
import { LoginPageConnector } from "$lib/connectors/index";
import { UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAnon, MockSessionRaw, MockSessionUser } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { setContext } from "svelte";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@a-novel-kit/nodelib-browser/http";
import { AuthenticationApi, claimsGet, tokenCreate, tokenCreateAnon } from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    tokenCreate: vi.fn(),
    tokenCreateAnon: vi.fn(),
    tokenRefresh: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockTokenCreate = tokenCreate as Mock,
  mockTokenCreateAnon = tokenCreateAnon as Mock,
  mockClaimsGet = claimsGet as Mock,
  setScreen = vi.fn();

let submitButton: HTMLButtonElement,
  loginPage: ReturnType<typeof render<typeof UITestWrapper>>,
  emailField: HTMLInputElement,
  passwordField: HTMLInputElement,
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

  loginPage = render(UITestWrapper, {
    api,
    children: createTestSnippet(LoginPageConnector, { api }, undefined, () => {
      setContext(SESSION_SCREEN_CONTEXT_KEY, { setScreen });
    }),
  });

  // Wait for the form element to be rendered.
  await waitFor(() => {
    const form = loginPage.queryByRole("form", {
      name: /login/i,
    });
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });

  submitButton = loginPage.queryByRole("button", { name: /login/i }) as HTMLButtonElement;
  emailField = loginPage.queryByLabelText(/email/i) as HTMLInputElement;
  passwordField = loginPage.queryAllByLabelText(/password/i)[0] as HTMLInputElement;

  expect(submitButton).toBeDefined();
  expect(submitButton).not.toBeNull();
  expect(emailField).toBeDefined();
  expect(emailField).not.toBeNull();
  expect(passwordField).toBeDefined();
  expect(passwordField).not.toBeNull();
}

describe("login page", () => {
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
      expect(mockTokenCreate).not.toHaveBeenCalled();

      // Only password filled.
      await user.type(passwordField, "s3cr3t!");
      await user.click(submitButton);
      expect(mockTokenCreate).not.toHaveBeenCalled();

      // Only email filled.
      await user.clear(passwordField);
      await user.type(emailField, "john.doe@gmail.com");

      await user.click(submitButton);
      expect(mockTokenCreate).not.toHaveBeenCalled();

      // Both filled but email invalid.
      await user.clear(emailField);
      await user.type(passwordField, "s3cr3t!");
      await user.type(emailField, "john.doe");
      await waitFor(() => {
        expect(emailField.dataset.status).toBe("idle");
      });

      await user.click(submitButton);
      expect(mockTokenCreate).not.toHaveBeenCalled();
    });

    it("reports success and redirect", async () => {
      await user.type(emailField, "john.doe@gmail.com");
      await user.type(passwordField, "s3cr3t!");

      mockTokenCreate.mockReturnValueOnce(Promise.resolve(MockSessionRaw));
      mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockTokenCreate).toHaveBeenCalledExactlyOnceWith(api, {
          email: "john.doe@gmail.com",
          password: "s3cr3t!",
        });
      });
      await waitFor(() => {
        expect(mockClaimsGet).toHaveBeenLastCalledWith(api, MockSessionRaw.accessToken);
      });

      await waitFor(() => {
        const loginSuccessModal = loginPage.queryByText(/login successful/i);
        expect(loginSuccessModal).toBeDefined();
        expect(loginSuccessModal).not.toBeNull();
        expect(setScreen).not.toHaveBeenCalled();
      });

      await new Promise((resolve) => setTimeout(() => resolve(true), 1000));

      await waitFor(() => {
        expect(setScreen).toHaveBeenCalledExactlyOnceWith();
      });
    });

    describe("on error", () => {
      it("reports email not found", async () => {
        await user.type(emailField, "john.doe@gmail.com");
        await user.type(passwordField, "s3cr3t!");

        mockTokenCreate.mockImplementationOnce(async () => {
          throw new HttpError(404, "email not found");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockTokenCreate).toHaveBeenCalledExactlyOnceWith(api, {
            email: "john.doe@gmail.com",
            password: "s3cr3t!",
          });
          expect(emailField.dataset.status).toBe("invalid");
        });

        const errorMessage = loginPage.queryByText(/no account found with the provided email/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        expect(setScreen).not.toHaveBeenCalled();
      });

      it("reports password incorrect", async () => {
        await user.type(emailField, "john.doe@gmail.com");
        await user.type(passwordField, "s3cr3t!");

        mockTokenCreate.mockImplementationOnce(async () => {
          throw new HttpError(403, "password incorrect");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockTokenCreate).toHaveBeenCalledExactlyOnceWith(api, {
            email: "john.doe@gmail.com",
            password: "s3cr3t!",
          });
          expect(passwordField.dataset.status).toBe("invalid");
        });

        const errorMessage = loginPage.queryByText(/the provided password is not the correct one/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        expect(setScreen).not.toHaveBeenCalled();
      });

      it("reports any error", async () => {
        await user.type(emailField, "john.doe@gmail.com");
        await user.type(passwordField, "s3cr3t!");

        mockTokenCreate.mockImplementationOnce(async () => {
          throw new HttpError(500, "ouh la la");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockTokenCreate).toHaveBeenCalledExactlyOnceWith(api, {
            email: "john.doe@gmail.com",
            password: "s3cr3t!",
          });
        });

        const errorMessage = loginPage.queryByText(/an unknown error occurred during session creation/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        expect(setScreen).not.toHaveBeenCalled();
      });
    });
  });

  describe("actions", () => {
    beforeEach(() => prepare(setupBase));

    it("goes to password reset screen", async () => {
      const passwordResetButton = loginPage.getByRole("button", { name: /forgot your password/i });
      expect(passwordResetButton).toBeDefined();
      expect(passwordResetButton).not.toBeNull();

      await user.click(passwordResetButton);

      await waitFor(() => {
        expect(setScreen).toHaveBeenCalledExactlyOnceWith("passwordReset");
      });
    });

    it("goes to register screen", async () => {
      const passwordResetButton = loginPage.getByRole("button", { name: /register/i });
      expect(passwordResetButton).toBeDefined();
      expect(passwordResetButton).not.toBeNull();

      await user.click(passwordResetButton);

      await waitFor(() => {
        expect(setScreen).toHaveBeenCalledExactlyOnceWith("register");
      });
    });
  });
});
