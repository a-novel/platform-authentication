import { MockSessionAnon } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, describe, expect, it, vi } from "vitest";

import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import { AuthenticationApi, Role, claimsGet, credentialsUpdateEmail } from "@a-novel/service-authentication-rest";

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
    credentialsUpdateEmail: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const userID = "36dcee2c-4f29-4596-a346-ff843f60813f";
// Base64 URL-safe encoded "john.doe@gmail.com" (Go's base64.RawURLEncoding)
const encodedEmail = "am9obi5kb2VAZ21haWwuY29t";

vi.mock("$app/state", () => ({
  page: {
    url: new URL(`http://localhost/ext/email/validate?shortCode=abcdef&target=${userID}&source=${encodedEmail}`),
  },
}));

const mockClaimsGet = claimsGet as Mock;
const mockCredentialsUpdateEmail = credentialsUpdateEmail as Mock;

describe("/ext/email/validate", () => {
  it("renders loading state then calls API with decoded parameters", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
    mockCredentialsUpdateEmail.mockReturnValueOnce(
      Promise.resolve({
        id: userID,
        email: "john.doe@gmail.com",
        role: Role.User,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      })
    );

    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");

    const page = render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    await waitFor(() => {
      const successMessage = page.queryByText(/email validated successfully/i);
      expect(successMessage).toBeInTheDocument();
    });

    expect(mockCredentialsUpdateEmail).toHaveBeenCalledWith(
      expect.any(AuthenticationApi),
      MockSessionAnon.accessToken,
      {
        userID,
        shortCode: "abcdef",
      }
    );
  });

  it("displays error message on API failure", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));

    const { HttpError } = await import("@a-novel-kit/nodelib-browser/http");
    mockCredentialsUpdateEmail.mockRejectedValueOnce(new HttpError(403, "Forbidden"));

    const { default: Page } = await import("./+page.svelte");
    const { UITestWrapper, createTestSnippet } = await import("$lib/test");
    const { authenticationApi } = await import("$lib");

    const page = render(UITestWrapper, {
      api: authenticationApi,
      children: createTestSnippet(Page, {}),
    });

    await waitFor(() => {
      const errorMessage = page.queryByText(/email validation failed/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
