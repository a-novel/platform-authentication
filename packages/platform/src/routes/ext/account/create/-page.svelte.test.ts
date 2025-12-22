import { MockSessionAnon } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, describe, expect, it, vi } from "vitest";

import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import { AuthenticationApi, claimsGet, credentialsCreate } from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";

// Mock the lib's authenticationApi export
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
    credentialsCreate: vi.fn(),
    claimsGet: vi.fn(),
  };
});

// Mock SvelteKit's $app/state
vi.mock("$app/state", () => ({
  page: {
    url: new URL("http://localhost/ext/account/create?shortCode=abcdef&target=am9obi5kb2VAZ21haWwuY29t"),
  },
}));

const mockClaimsGet = claimsGet as Mock;
const mockCredentialsCreate = credentialsCreate as Mock;

describe("/ext/account/create", () => {
  it("renders the register form with decoded URL parameters", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));

    // Dynamic import to allow mocks to be set up first
    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");

    const page = render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    await waitFor(() => {
      const form = page.queryByRole("form", { name: /register completion form/i });
      expect(form).toBeInTheDocument();
    });

    // Verify password fields are present
    const passwordField = page.queryByLabelText(/^password$/i);
    const passwordConfirmField = page.queryByLabelText(/^confirm password$/i);
    expect(passwordField).toBeInTheDocument();
    expect(passwordConfirmField).toBeInTheDocument();
  });

  it("calls credentialsCreate with correct decoded email from base64 URL param", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
    mockCredentialsCreate.mockReturnValueOnce(Promise.resolve());

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
      expect(page.queryByRole("form", { name: /register completion form/i })).toBeInTheDocument();
    });

    const passwordField = page.getByLabelText(/^password$/i) as HTMLInputElement;
    const passwordConfirmField = page.getByLabelText(/^confirm password$/i) as HTMLInputElement;
    const submitButton = page.getByRole("button", { name: /^create account$/i });

    await user.type(passwordField, "test-password-123");
    await user.type(passwordConfirmField, "test-password-123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCredentialsCreate).toHaveBeenCalledWith(expect.any(AuthenticationApi), MockSessionAnon.accessToken, {
        email: "john.doe@gmail.com", // Decoded from base64: am9obi5kb2VAZ21haWwuY29t
        shortCode: "abcdef",
        password: "test-password-123",
      });
    });
  });
});
