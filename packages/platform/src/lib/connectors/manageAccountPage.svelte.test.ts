import { ManageAccountPageConnector } from "$lib/connectors";
import { UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionUser } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@a-novel-kit/nodelib-browser/http";
import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import {
  AuthenticationApi,
  Lang,
  claimsGet,
  credentialsUpdatePassword,
  shortCodeCreateEmailUpdate,
} from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    credentialsUpdatePassword: vi.fn(),
    shortCodeCreateEmailUpdate: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockClaimsGet = claimsGet as Mock,
  mockCredentialsUpdatePassword = credentialsUpdatePassword as Mock,
  mockShortCodeCreateEmailUpdate = shortCodeCreateEmailUpdate as Mock;

let user: ReturnType<(typeof userEvent)["setup"]>,
  manageAccountPage: ReturnType<typeof render<typeof UITestWrapper>>,
  emailUpdateSubmitButton: HTMLButtonElement,
  emailUpdateEmailField: HTMLInputElement,
  passwordUpdateSubmitButton: HTMLButtonElement,
  passwordUpdateCurrentPasswordField: HTMLInputElement,
  passwordUpdateNewPasswordField: HTMLInputElement,
  passwordUpdateNewPasswordConfirmField: HTMLInputElement;

function setupBase() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));
}

async function prepare(setup: () => void) {
  user = userEvent.setup();
  setup();

  manageAccountPage = render(UITestWrapper, {
    api,
    children: createTestSnippet(ManageAccountPageConnector, { api }),
  });

  // Wait for the form element to be rendered.
  await waitFor(() => {
    const form = manageAccountPage.queryByRole("form", {
      name: /email update/i,
    });
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });
  await waitFor(() => {
    const form = manageAccountPage.queryByRole("form", {
      name: /password update/i,
    });
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });

  emailUpdateSubmitButton = manageAccountPage.queryByRole("button", {
    name: /^get validation link$/i,
  }) as HTMLButtonElement;
  emailUpdateEmailField = manageAccountPage.queryByLabelText(/^new email$/i) as HTMLInputElement;

  passwordUpdateSubmitButton = manageAccountPage.queryByRole("button", {
    name: /^update password$/i,
  }) as HTMLButtonElement;
  passwordUpdateCurrentPasswordField = manageAccountPage.queryByLabelText(/^current password$/i) as HTMLInputElement;
  passwordUpdateNewPasswordField = manageAccountPage.queryByLabelText(/^new password$/i) as HTMLInputElement;
  passwordUpdateNewPasswordConfirmField = manageAccountPage.queryByLabelText(
    /^confirm new password$/i
  ) as HTMLInputElement;

  expect(emailUpdateSubmitButton).toBeDefined();
  expect(emailUpdateSubmitButton).not.toBeNull();
  expect(emailUpdateEmailField).toBeDefined();
  expect(emailUpdateEmailField).not.toBeNull();
  expect(passwordUpdateSubmitButton).toBeDefined();
  expect(passwordUpdateSubmitButton).not.toBeNull();
  expect(passwordUpdateCurrentPasswordField).toBeDefined();
  expect(passwordUpdateCurrentPasswordField).not.toBeNull();
  expect(passwordUpdateNewPasswordField).toBeDefined();
  expect(passwordUpdateNewPasswordField).not.toBeNull();
  expect(passwordUpdateNewPasswordConfirmField).toBeDefined();
  expect(passwordUpdateNewPasswordConfirmField).not.toBeNull();
}

describe("email update", () => {
  describe("submit", () => {
    beforeEach(() => prepare(setupBase));

    it("does not submit while fields are invalid", async () => {
      // Fields empty.
      await user.click(emailUpdateSubmitButton);
      expect(mockShortCodeCreateEmailUpdate).not.toHaveBeenCalled();

      // Filled but email invalid.
      await user.clear(emailUpdateEmailField);
      await user.type(emailUpdateEmailField, "john.doe");
      await waitFor(() => {
        expect(emailUpdateEmailField.dataset.status).toBe("idle");
      });

      await user.click(emailUpdateSubmitButton);
      expect(mockShortCodeCreateEmailUpdate).not.toHaveBeenCalled();
    });

    it("reports success", async () => {
      await user.type(emailUpdateEmailField, "john.doe@gmail.com");

      mockShortCodeCreateEmailUpdate.mockReturnValueOnce(Promise.resolve());

      await user.click(emailUpdateSubmitButton);

      await waitFor(() => {
        expect(mockShortCodeCreateEmailUpdate).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken, {
          email: "john.doe@gmail.com",
          lang: Lang.En,
        });
      });

      await waitFor(() => {
        const successMessage = manageAccountPage.queryByText(/confirmation email sent/i);
        expect(successMessage).toBeDefined();
        expect(successMessage).not.toBeNull();
      });

      // Form should not be visible anymore.
      const form = manageAccountPage.queryByRole("form", {
        name: /email update/i,
      });
      expect(form).toBeNull();
      // Neither should form elements.
      expect(emailUpdateEmailField).not.toBeInTheDocument();
      expect(emailUpdateSubmitButton).not.toBeInTheDocument();
    });

    describe("on error", () => {
      it("reports email already in use", async () => {
        await user.type(emailUpdateEmailField, "john.doe@gmail.com");

        mockShortCodeCreateEmailUpdate.mockImplementationOnce(async () => {
          throw new HttpError(409, "Conflict");
        });

        // Send form anyway.
        await user.click(emailUpdateSubmitButton);

        await waitFor(() => {
          expect(mockShortCodeCreateEmailUpdate).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken, {
            email: "john.doe@gmail.com",
            lang: Lang.En,
          });
        });

        await waitFor(() => {
          const errorMessage = manageAccountPage.queryByText(/an account with this email already exists/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });
      });

      it("reports any error", async () => {
        await user.type(emailUpdateEmailField, "john.doe@gmail.com");

        mockShortCodeCreateEmailUpdate.mockImplementationOnce(async () => {
          throw new Error("badaboom");
        });

        // Send form anyway.
        await user.click(emailUpdateSubmitButton);

        await waitFor(() => {
          expect(mockShortCodeCreateEmailUpdate).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken, {
            email: "john.doe@gmail.com",
            lang: Lang.En,
          });
        });

        await waitFor(() => {
          const errorMessage = manageAccountPage.queryByText(/email update failed/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });
      });
    });
  });
});

describe("password update", () => {
  describe("fields", () => {
    beforeEach(() => prepare(setupBase));

    describe("new password", () => {
      it("reports mismatch", async () => {
        await user.type(passwordUpdateCurrentPasswordField, "current-password-123");
        await user.type(passwordUpdateNewPasswordField, "new-password-123");
        await user.type(passwordUpdateNewPasswordConfirmField, "new-password-124");

        // Submit form to trigger validation.
        await user.click(passwordUpdateSubmitButton);

        await waitFor(() => {
          expect(passwordUpdateNewPasswordConfirmField.dataset.status).toBe("invalid");
        });

        const errorMessage = manageAccountPage.queryByText(/passwords do not match/i);
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBeNull();

        // API is not called.
        expect(mockCredentialsUpdatePassword).not.toHaveBeenCalled();
      });
    });
  });

  describe("submit", () => {
    beforeEach(() => prepare(setupBase));

    it("does not submit while fields are invalid", async () => {
      // Fields empty.
      await user.click(passwordUpdateSubmitButton);
      expect(mockCredentialsUpdatePassword).not.toHaveBeenCalled();

      // Only current password filled.
      await user.type(passwordUpdateCurrentPasswordField, "current-password-123");
      await user.click(passwordUpdateSubmitButton);
      expect(mockCredentialsUpdatePassword).not.toHaveBeenCalled();

      // Current and new password filled.
      await user.type(passwordUpdateNewPasswordField, "new-password-123");
      await user.click(passwordUpdateSubmitButton);
      expect(mockCredentialsUpdatePassword).not.toHaveBeenCalled();

      // All filled but new passwords do not match.
      await user.type(passwordUpdateNewPasswordConfirmField, "new-password-124");
      await user.click(passwordUpdateSubmitButton);
      expect(mockCredentialsUpdatePassword).not.toHaveBeenCalled();

      // Only the new password is filled.
      await user.clear(passwordUpdateCurrentPasswordField);
      await user.clear(passwordUpdateNewPasswordConfirmField);
      await user.click(passwordUpdateSubmitButton);
      await user.type(passwordUpdateNewPasswordConfirmField, "new-password-123");
      expect(mockCredentialsUpdatePassword).not.toHaveBeenCalled();
    });

    it("reports success", async () => {
      await user.type(passwordUpdateCurrentPasswordField, "current-password-123");
      await user.type(passwordUpdateNewPasswordField, "new-password-123");
      await user.type(passwordUpdateNewPasswordConfirmField, "new-password-123");

      mockCredentialsUpdatePassword.mockReturnValueOnce(Promise.resolve());

      await user.click(passwordUpdateSubmitButton);

      await waitFor(() => {
        expect(mockCredentialsUpdatePassword).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken, {
          currentPassword: "current-password-123",
          password: "new-password-123",
        });
      });

      await waitFor(() => {
        const successMessage = manageAccountPage.queryByText(/password updated successfully/i);
        expect(successMessage).toBeDefined();
        expect(successMessage).not.toBeNull();
      });
    });

    describe("on error", () => {
      it("handles invalid current password error", async () => {
        await user.type(passwordUpdateCurrentPasswordField, "current-password-123");
        await user.type(passwordUpdateNewPasswordField, "new-password-123");
        await user.type(passwordUpdateNewPasswordConfirmField, "new-password-123");

        mockCredentialsUpdatePassword.mockImplementationOnce(async () => {
          throw new HttpError(403, "forbidden");
        });

        await user.click(passwordUpdateSubmitButton);

        await waitFor(() => {
          expect(mockCredentialsUpdatePassword).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken, {
            currentPassword: "current-password-123",
            password: "new-password-123",
          });
        });

        await waitFor(() => {
          const errorMessage = manageAccountPage.queryByText(/the provided password is not the correct one/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });
      });

      it("handles any error", async () => {
        await user.type(passwordUpdateCurrentPasswordField, "current-password-123");
        await user.type(passwordUpdateNewPasswordField, "new-password-123");
        await user.type(passwordUpdateNewPasswordConfirmField, "new-password-123");

        mockCredentialsUpdatePassword.mockImplementationOnce(async () => {
          throw new Error("badaboom");
        });

        await user.click(passwordUpdateSubmitButton);

        await waitFor(() => {
          expect(mockCredentialsUpdatePassword).toHaveBeenCalledExactlyOnceWith(api, MockSessionUser.accessToken, {
            currentPassword: "current-password-123",
            password: "new-password-123",
          });
        });

        await waitFor(() => {
          const errorMessage = manageAccountPage.queryByText(/password update failed/i);
          expect(errorMessage).toBeDefined();
          expect(errorMessage).not.toBeNull();
        });
      });
    });
  });
});
