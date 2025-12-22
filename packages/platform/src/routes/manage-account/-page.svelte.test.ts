// packages/platform/src/routes/manage-account/+page.svelte.test.ts
import { MockSessionUser } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, describe, expect, it, vi } from "vitest";

import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import {
  AuthenticationApi,
  claimsGet,
  credentialsUpdatePassword,
  shortCodeCreateEmailUpdate,
} from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib", async (importOriginal) => {
  const mod = await importOriginal<typeof import("$lib")>();
  return {
    ...mod,
    authenticationApi: new AuthenticationApi("http://auth-api.local"),
  };
});

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    credentialsUpdatePassword: vi.fn(),
    shortCodeCreateEmailUpdate: vi.fn(),
    claimsGet: vi.fn(),
  };
});

vi.mock("$app/state", () => ({
  page: {
    url: new URL("http://localhost/manage-account"),
  },
}));

const mockClaimsGet = claimsGet as Mock;
const mockCredentialsUpdatePassword = credentialsUpdatePassword as Mock;
const mockShortCodeCreateEmailUpdate = shortCodeCreateEmailUpdate as Mock;

describe("/manage-account", () => {
  it("renders both forms when user is authenticated", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));

    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");

    const page = render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    await waitFor(() => {
      const emailForm = page.queryByRole("form", { name: /email update/i });
      expect(emailForm).toBeInTheDocument();
    });

    await waitFor(() => {
      const passwordForm = page.queryByRole("form", { name: /password update/i });
      expect(passwordForm).toBeInTheDocument();
    });

    // Verify key form elements
    expect(page.queryByLabelText(/^new email$/i)).toBeInTheDocument();
    expect(page.queryByLabelText(/^current password$/i)).toBeInTheDocument();
    expect(page.queryByLabelText(/^new password$/i)).toBeInTheDocument();
  });

  it("sets page title correctly", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));

    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");

    render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    // Page title should be set (check meta via document.title or head element)
    await waitFor(() => {
      expect(document.title).toContain("Account management");
    });
  });

  it("allows email update form submission", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));
    mockShortCodeCreateEmailUpdate.mockReturnValueOnce(Promise.resolve());

    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");
    const { userEvent } = await import("@testing-library/user-event");

    const user = userEvent.setup();
    const page = render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    await waitFor(() => {
      expect(page.queryByRole("form", { name: /email update/i })).toBeInTheDocument();
    });

    const emailField = page.getByLabelText(/^new email$/i) as HTMLInputElement;
    const submitButton = page.getByRole("button", { name: /^get validation link$/i });

    await user.type(emailField, "new.email@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockShortCodeCreateEmailUpdate).toHaveBeenCalled();
    });
  });

  it("allows password update form submission", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionUser.claims));
    mockCredentialsUpdatePassword.mockReturnValueOnce(Promise.resolve());

    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");
    const { userEvent } = await import("@testing-library/user-event");

    const user = userEvent.setup();
    const page = render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    await waitFor(() => {
      expect(page.queryByRole("form", { name: /password update/i })).toBeInTheDocument();
    });

    const currentPasswordField = page.getByLabelText(/^current password$/i) as HTMLInputElement;
    const newPasswordField = page.getByLabelText(/^new password$/i) as HTMLInputElement;
    const confirmPasswordField = page.getByLabelText(/^confirm new password$/i) as HTMLInputElement;
    const submitButton = page.getByRole("button", { name: /^update password$/i });

    await user.type(currentPasswordField, "current-password");
    await user.type(newPasswordField, "new-password-123");
    await user.type(confirmPasswordField, "new-password-123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCredentialsUpdatePassword).toHaveBeenCalledWith(
        expect.any(AuthenticationApi),
        MockSessionUser.accessToken,
        {
          currentPassword: "current-password",
          password: "new-password-123",
        }
      );
    });
  });
});
