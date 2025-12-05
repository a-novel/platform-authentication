import { SESSION_SCREEN_CONTEXT_KEY, SESSION_STORAGE_KEY } from "$lib";
import { PasswordResetPageConnector } from "$lib/connectors/index";
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
  credentialsExists,
  shortCodeCreatePasswordReset,
  tokenCreateAnon,
} from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    tokenCreateAnon: vi.fn(),
    credentialsExists: vi.fn(),
    shortCodeCreatePasswordReset: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockTokenCreateAnon = tokenCreateAnon as Mock,
  mockShortCodeCreatePasswordReset = shortCodeCreatePasswordReset as Mock,
  mockClaimsGet = claimsGet as Mock,
  mockCredentialsExists = credentialsExists as Mock;

let submitButton: HTMLButtonElement,
  passwordResetPage: ReturnType<typeof render<typeof UITestWrapper>>,
  emailField: HTMLInputElement,
  user: ReturnType<(typeof userEvent)["setup"]>,
  setScreen = vi.fn();

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

  passwordResetPage = render(UITestWrapper, {
    api,
    children: createTestSnippet(PasswordResetPageConnector, { api }, undefined, () => {
      setContext(SESSION_SCREEN_CONTEXT_KEY, { setScreen });
    }),
  });

  // Wait for the form element to be rendered.
  await waitFor(() => {
    const form = passwordResetPage.queryByRole("form", {
      name: /password-reset form/i,
    });
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });

  submitButton = passwordResetPage.queryByRole("button", { name: /reset password/i }) as HTMLButtonElement;
  emailField = passwordResetPage.getByLabelText(/email/i) as HTMLInputElement;

  expect(submitButton).toBeDefined();
  expect(submitButton).not.toBeNull();
  expect(emailField).toBeDefined();
  expect(emailField).not.toBeNull();
}

describe("passwordReset page", () => {
  describe("submit button", () => {
    beforeEach(() => prepare(setupDelayed));

    it("is enabled", async () => {
      await waitFor(() => {
        expect(submitButton.disabled).toBeFalsy();
      });
    });
  });

  describe("fields", () => {
    beforeEach(() => prepare(setupBase));

    describe("email", () => {
      it("does not trigger api validation while email is not valid", async () => {
        await user.type(emailField, "john.doe");

        await waitFor(() => {
          expect(mockCredentialsExists).not.toHaveBeenCalled();
          expect(emailField.dataset.status).toBe("idle");
        });
      });

      it("reports success", async () => {
        mockCredentialsExists.mockReturnValueOnce(Promise.resolve(true));
        await user.type(emailField, "john.doe@gmail.com");

        await waitFor(() => {
          expect(emailField.dataset.status).toBe("validating");
        });

        await waitFor(() => {
          expect(mockCredentialsExists).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email: "john.doe@gmail.com",
          });
          expect(emailField.dataset.status).toBe("valid");
        });
      });

      describe("does not exist", () => {
        it("reports error", async () => {
          mockCredentialsExists.mockReturnValueOnce(Promise.resolve(false));
          await user.type(emailField, "joh.doe@gmail.com");

          await waitFor(() => {
            expect(mockCredentialsExists).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
              email: "joh.doe@gmail.com",
            });
            expect(emailField.dataset.status).toBe("invalid");
          });

          const errorMessage = passwordResetPage.queryByText(/no account found with the provided email/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });

        it("recovers from error", async () => {
          mockCredentialsExists.mockReturnValueOnce(Promise.resolve(false));
          await user.type(emailField, "joh.doe@gmail.com");

          await waitFor(() => {
            expect(mockCredentialsExists).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
              email: "joh.doe@gmail.com",
            });
            expect(emailField.dataset.status).toBe("invalid");
          });

          mockCredentialsExists.mockReturnValueOnce(Promise.resolve(true));
          await user.type(emailField, "n", { initialSelectionStart: 3 });

          await waitFor(() => {
            expect(mockCredentialsExists).toHaveBeenCalledTimes(2);
            expect(mockCredentialsExists).toHaveBeenLastCalledWith(api, MockSessionAnon.accessToken, {
              email: "john.doe@gmail.com",
            });
            expect(emailField.dataset.status).toBe("valid");
          });

          const errorMessage = passwordResetPage.queryByText(/no account found with the provided email/i);
          expect(errorMessage).toBeNull();
        });
      });

      describe("unexpected error", () => {
        it("reports error", async () => {
          mockCredentialsExists.mockImplementationOnce(async () => {
            throw new Error("badaboom");
          });
          await user.type(emailField, "joh.doe@gmail.com");

          await waitFor(() => {
            expect(mockCredentialsExists).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
              email: "joh.doe@gmail.com",
            });
            expect(emailField.dataset.status).toBe("idle");
          });

          const errorMessage = passwordResetPage.queryByText(/cannot validate email due to unexpected error/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });

        it("recovers from error", async () => {
          mockCredentialsExists.mockImplementationOnce(async () => {
            throw new Error("badaboom");
          });
          await user.type(emailField, "joh.doe@gmail.com");

          await waitFor(() => {
            expect(mockCredentialsExists).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
              email: "joh.doe@gmail.com",
            });
            expect(emailField.dataset.status).toBe("idle");
          });

          mockCredentialsExists.mockReturnValueOnce(Promise.resolve(true));
          await user.type(emailField, "n", { initialSelectionStart: 3 });

          await waitFor(() => {
            expect(mockCredentialsExists).toHaveBeenCalledTimes(2);
            expect(mockCredentialsExists).toHaveBeenLastCalledWith(api, MockSessionAnon.accessToken, {
              email: "john.doe@gmail.com",
            });
            expect(emailField.dataset.status).toBe("valid");
          });

          const errorMessage = passwordResetPage.queryByText(/cannot validate email due to unexpected error/i);
          expect(errorMessage).toBeNull();
        });
      });
    });
  });

  describe("submit", () => {
    beforeEach(() => prepare(setupBase));

    it("does not submit while fields are invalid", async () => {
      // Fields empty.
      await user.click(submitButton);
      expect(mockShortCodeCreatePasswordReset).not.toHaveBeenCalled();

      // Email filled but invalid.
      await user.clear(emailField);
      await user.type(emailField, "john.doe");
      await waitFor(() => {
        expect(emailField.dataset.status).toBe("idle");
      });

      await user.click(submitButton);
      expect(mockShortCodeCreatePasswordReset).not.toHaveBeenCalled();
    });

    it("reports success", async () => {
      mockCredentialsExists.mockReturnValueOnce(Promise.resolve(true));
      await user.type(emailField, "john.doe@gmail.com");

      await waitFor(() => {
        expect(emailField.dataset.status).toBe("valid");
      });

      mockShortCodeCreatePasswordReset.mockReturnValueOnce(Promise.resolve());

      const submitButton = passwordResetPage.getByRole("button", { name: /reset password/i }) as HTMLButtonElement;
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShortCodeCreatePasswordReset).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
          email: "john.doe@gmail.com",
          lang: Lang.En,
        });
      });

      await waitFor(() => {
        const passwordResetSuccessModal = passwordResetPage.queryByText(/password-reset form created/i);
        expect(passwordResetSuccessModal).toBeDefined();
        expect(passwordResetSuccessModal).not.toBeNull();
      });

      const loginButton = passwordResetPage.getByRole("button", { name: /login/i }) as HTMLButtonElement;
      expect(loginButton).toBeDefined();
      expect(loginButton).not.toBeNull();

      await user.click(loginButton);

      await waitFor(() => {
        expect(setScreen).toHaveBeenCalledExactlyOnceWith("login");
      });
    });

    describe("on error", () => {
      it("reports email not found", async () => {
        mockCredentialsExists.mockReturnValueOnce(Promise.resolve(true));
        await user.type(emailField, "john.doe@gmail.com");

        await waitFor(() => {
          expect(emailField.dataset.status).toBe("valid");
        });

        mockShortCodeCreatePasswordReset.mockImplementationOnce(async () => {
          throw new HttpError(404, "email not found");
        });

        const submitButton = passwordResetPage.getByRole("button", { name: /reset password/i }) as HTMLButtonElement;
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockShortCodeCreatePasswordReset).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email: "john.doe@gmail.com",
            lang: Lang.En,
          });
          expect(emailField.dataset.status).toBe("invalid");
        });

        const errorMessage = passwordResetPage.queryByText(/no account found with the provided email/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        expect(setScreen).not.toHaveBeenCalled();
      });

      it("reports any error", async () => {
        mockCredentialsExists.mockReturnValueOnce(Promise.resolve(true));
        await user.type(emailField, "john.doe@gmail.com");

        await waitFor(() => {
          expect(emailField.dataset.status).toBe("valid");
        });

        mockShortCodeCreatePasswordReset.mockImplementationOnce(async () => {
          throw new HttpError(500, "ouh la la");
        });

        const submitButton = passwordResetPage.getByRole("button", { name: /reset password/i }) as HTMLButtonElement;
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockShortCodeCreatePasswordReset).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
            email: "john.doe@gmail.com",
            lang: Lang.En,
          });
        });

        const errorMessage = passwordResetPage.queryByText(
          /an unknown error occurred during password-reset form creation/i
        );
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        expect(setScreen).not.toHaveBeenCalled();
      });
    });
  });

  describe("actions", () => {
    beforeEach(() => prepare(setupBase));

    it("goes to login screen", async () => {
      const passwordResetButton = passwordResetPage.getByRole("button", { name: /login/i });
      expect(passwordResetButton).toBeDefined();
      expect(passwordResetButton).not.toBeNull();

      await user.click(passwordResetButton);

      await waitFor(() => {
        expect(setScreen).toHaveBeenCalledExactlyOnceWith("login");
      });
    });
  });
});
