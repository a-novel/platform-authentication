import { ValidateEmailPageConnector } from "$lib/connectors";
import { UITestWrapper, createTestSnippet } from "$lib/test";
import { MockSessionAnon } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, describe, expect, it, vi } from "vitest";

import { HttpError } from "@a-novel-kit/nodelib-browser/http";
import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import { AuthenticationApi, Role, claimsGet, credentialsUpdateEmail } from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    credentialsUpdateEmail: vi.fn(),
    claimsGet: vi.fn(),
  };
});

const api = new AuthenticationApi("http://auth-api.local");

const mockClaimsGet = claimsGet as Mock,
  mockCredentialsUpdateEmail = credentialsUpdateEmail as Mock,
  userID = "36dcee2c-4f29-4596-a346-ff843f60813f",
  email = "john.doe@gmail.com",
  shortCode = "abcdef";

let validateEmailPage: ReturnType<typeof render<typeof UITestWrapper>>;

function setupBase() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
  mockClaimsGet.mockReturnValueOnce(Promise.resolve(MockSessionAnon.claims));
}

async function prepare(setup: () => void) {
  setup();

  validateEmailPage = render(UITestWrapper, {
    api,
    children: createTestSnippet(ValidateEmailPageConnector, { api, userID, shortCode, email }),
  });
}

describe("validate email", () => {
  it("reports success", async () => {
    mockCredentialsUpdateEmail.mockReturnValueOnce(
      Promise.resolve({
        id: userID,
        email,
        role: Role.User,
        createdAt: "2018-02-02T12:00:00Z",
        updatedAt: "2018-02-02T12:00:00Z",
      })
    );

    await prepare(() => {
      setupBase();
    });

    await waitFor(() => {
      const successMessage = validateEmailPage.queryByText(/email validated successfully/i);
      expect(successMessage).toBeDefined();
      expect(successMessage).not.toBeNull();
      expect(successMessage).toBeVisible();
    });

    expect(mockCredentialsUpdateEmail).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
      userID,
      shortCode,
    });
  });

  it("reports loading then success", async () => {
    const apiResponse = {
      id: userID,
      email,
      role: Role.User,
      createdAt: "2018-02-02T12:00:00Z",
      updatedAt: "2018-02-02T12:00:00Z",
    };

    mockCredentialsUpdateEmail.mockReturnValueOnce(
      new Promise((resolve) => setTimeout(() => resolve(apiResponse), 100))
    );

    await prepare(() => {
      setupBase();
    });

    let loadingMessage: HTMLElement | null;

    await waitFor(() => {
      loadingMessage = validateEmailPage.queryByText(/validating email/i);
      expect(loadingMessage).toBeDefined();
      expect(loadingMessage).not.toBeNull();
      expect(loadingMessage).toBeVisible();
      expect(loadingMessage).toBeInTheDocument();
    });

    await waitFor(() => {
      const successMessage = validateEmailPage.queryByText(/email validated successfully/i);
      expect(successMessage).toBeDefined();
      expect(successMessage).not.toBeNull();
      expect(successMessage).toBeVisible();
      expect(successMessage).toBeInTheDocument();

      expect(loadingMessage).not.toBeInTheDocument();
    });

    expect(mockCredentialsUpdateEmail).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
      userID,
      shortCode,
    });
  });

  it("reports error", async () => {
    mockCredentialsUpdateEmail.mockImplementationOnce(async () => {
      throw new HttpError(403, "Forbidden");
    });

    await prepare(() => {
      setupBase();
    });

    await waitFor(() => {
      const successMessage = validateEmailPage.queryByText(/email validation failed/i);
      expect(successMessage).toBeDefined();
      expect(successMessage).not.toBeNull();
      expect(successMessage).toBeVisible();
    });

    expect(mockCredentialsUpdateEmail).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
      userID,
      shortCode,
    });
  });

  it("reports internal error", async () => {
    mockCredentialsUpdateEmail.mockImplementationOnce(async () => {
      throw new HttpError(500, "Internal");
    });

    await prepare(() => {
      setupBase();
    });

    await waitFor(() => {
      const successMessage = validateEmailPage.queryByText(/unexpected error/i);
      expect(successMessage).toBeDefined();
      expect(successMessage).not.toBeNull();
      expect(successMessage).toBeVisible();
    });

    expect(mockCredentialsUpdateEmail).toHaveBeenCalledExactlyOnceWith(api, MockSessionAnon.accessToken, {
      userID,
      shortCode,
    });
  });
});
