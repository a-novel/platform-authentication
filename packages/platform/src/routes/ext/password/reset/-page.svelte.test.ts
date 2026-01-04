import { MockSessionAnon } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, describe, expect, it, vi } from "vitest";

import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import { AuthenticationApi, claimsGet, credentialsResetPassword } from "@a-novel/service-authentication-rest";

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
    credentialsResetPassword: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const userID = "36dcee2c-4f29-4596-a346-ff843f60813f";

vi.mock("$app/state", () => ({
  page: {
    url: new URL(`http://localhost/ext/password/reset?shortCode=abcdef&target=${userID}`),
  },
}));

const mockClaimsGet = claimsGet as Mock;
const mockCredentialsResetPassword = credentialsResetPassword as Mock;

describe("/ext/password/reset", () => {
  it("renders the password reset form with URL parameters", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));

    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");

    const page = render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    await waitFor(() => {
      const form = page.queryByRole("form", { name: /password reset completion form/i });
      expect(form).toBeInTheDocument();
    });

    const passwordField = page.queryByLabelText(/^password$/i);
    const passwordConfirmField = page.queryByLabelText(/^confirm password$/i);
    expect(passwordField).toBeInTheDocument();
    expect(passwordConfirmField).toBeInTheDocument();
  });

  it("submits form and calls API with correct parameters", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
    mockCredentialsResetPassword.mockReturnValueOnce(Promise.resolve());

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
      expect(page.queryByRole("form", { name: /password reset completion form/i })).toBeInTheDocument();
    });

    const passwordField = page.getByLabelText(/^password$/i) as HTMLInputElement;
    const passwordConfirmField = page.getByLabelText(/^confirm password$/i) as HTMLInputElement;
    const submitButton = page.getByRole("button", { name: /^update password$/i });

    await user.type(passwordField, "new-password-123");
    await user.type(passwordConfirmField, "new-password-123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCredentialsResetPassword).toHaveBeenCalledWith(
        expect.any(AuthenticationApi),
        MockSessionAnon.accessToken,
        {
          userID,
          shortCode: "abcdef",
          password: "new-password-123",
        }
      );
    });

    await waitFor(() => {
      const successMessage = page.queryByText(/password reset successful/i);
      expect(successMessage).toBeInTheDocument();
    });
  });
});
