import { RegisterPageConnector } from "$lib/connectors";
import { UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAnon } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@a-novel-kit/nodelib-browser/http";
import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import { AuthenticationApi, claimsGet, credentialsCreate } from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    credentialsCreate: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockClaimsGet = claimsGet as Mock,
  mockCredentialsCreate = credentialsCreate as Mock,
  email = "john.doe@gmail.com",
  shortCode = "abcdef";

let user: ReturnType<(typeof userEvent)["setup"]>,
  registerPage: ReturnType<typeof render<typeof UITestWrapper>>,
  submitButton: HTMLButtonElement,
  passwordField: HTMLInputElement,
  passwordConfirmField: HTMLInputElement;

function setupBase() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

async function prepare(setup: () => void) {
  user = userEvent.setup();
  setup();

  registerPage = render(UITestWrapper, {
    api,
    children: createTestSnippet(RegisterPageConnector, { api, email, shortCode }),
  });

  // Wait for the form element to be rendered.
  await waitFor(() => {
    const form = registerPage.queryByRole("form", {
      name: /register completion form/i,
    });
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });

  submitButton = registerPage.queryByRole("button", {
    name: /^create account$/i,
  }) as HTMLButtonElement;
  passwordField = registerPage.queryByLabelText(/^password$/i) as HTMLInputElement;
  passwordConfirmField = registerPage.queryByLabelText(/^confirm password$/i) as HTMLInputElement;

  expect(submitButton).toBeDefined();
  expect(submitButton).not.toBeNull();
  expect(passwordField).toBeDefined();
  expect(passwordField).not.toBeNull();
  expect(passwordConfirmField).toBeDefined();
  expect(passwordConfirmField).not.toBeNull();
}

describe("register", () => {
  describe("fields", () => {
    beforeEach(() => prepare(setupBase));

    describe("password", () => {
      it("reports mismatch", async () => {
        await user.type(passwordField, "new-password-123");
        await user.type(passwordConfirmField, "new-password-124");

        // Submit form to trigger validation.
        await user.click(submitButton);

        await waitFor(() => {
          expect(passwordConfirmField.dataset.status).toBe("invalid");
        });

        const errorMessage = registerPage.queryByText(/passwords do not match/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        // API not called.
        expect(mockCredentialsCreate).not.toHaveBeenCalled();
      });
    });
  });

  describe("submit", () => {
    beforeEach(() => prepare(setupBase));

    it("does not submit while fields are invalid", async () => {
      // Fields empty.
      await user.click(submitButton);
      expect(mockCredentialsCreate).not.toHaveBeenCalled();

      // Only new password filled.
      await user.type(passwordField, "new-password-123");
      await user.click(submitButton);
      expect(mockCredentialsCreate).not.toHaveBeenCalled();

      // All filled but new passwords do not match.
      await user.type(passwordConfirmField, "new-password-124");
      await user.click(submitButton);
      expect(mockCredentialsCreate).not.toHaveBeenCalled();
    });

    it("reports success", async () => {
      await user.type(passwordField, "new-password-123");
      await user.type(passwordConfirmField, "new-password-123");

      mockCredentialsCreate.mockReturnValueOnce(Promise.resolve());

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCredentialsCreate).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
          email,
          shortCode,
          password: "new-password-123",
        });
      });

      await waitFor(() => {
        const successMessage = registerPage.queryByText(/registration successful/i);
        expect(successMessage).toBeDefined();
        expect(successMessage).not.toBeNull();
      });
    });

    describe("on error", () => {
      it("handles forbidden", async () => {
        await user.type(passwordField, "new-password-123");
        await user.type(passwordConfirmField, "new-password-123");

        mockCredentialsCreate.mockImplementationOnce(async () => {
          throw new HttpError(403, "Forbidden");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockCredentialsCreate).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email,
            shortCode,
            password: "new-password-123",
          });
        });

        await waitFor(() => {
          const errorMessage = registerPage.queryByText(
            /you are not allowed to create an account with the provided information/i
          );
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });
      });

      it("handles conflict", async () => {
        await user.type(passwordField, "new-password-123");
        await user.type(passwordConfirmField, "new-password-123");

        mockCredentialsCreate.mockImplementationOnce(async () => {
          throw new HttpError(409, "Conflict");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockCredentialsCreate).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email,
            shortCode,
            password: "new-password-123",
          });
        });

        await waitFor(() => {
          const errorMessage = registerPage.queryByText(/an account with the source email already exists/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });
      });

      it("handles any error", async () => {
        await user.type(passwordField, "new-password-123");
        await user.type(passwordConfirmField, "new-password-123");

        mockCredentialsCreate.mockImplementationOnce(async () => {
          throw new Error("badaboom");
        });

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockCredentialsCreate).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email,
            shortCode,
            password: "new-password-123",
          });
        });

        await waitFor(() => {
          const errorMessage = registerPage.queryByText(/registration failed/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });
      });
    });
  });
});
