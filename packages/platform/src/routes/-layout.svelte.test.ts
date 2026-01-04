import { MockSessionAnon, MockSessionUser } from "$lib/test/mocks/session";
import "$lib/test/setup/base";

import { type Mock, describe, expect, it, vi } from "vitest";

import { SESSION_STORAGE_KEY } from "@a-novel/package-authentication";
import { claimsGet, credentialsGet } from "@a-novel/service-authentication-rest";

import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib", async (importOriginal) => {
  const mod = await importOriginal<typeof import("$lib")>();
  const { AuthenticationApi } = await import("@a-novel/service-authentication-rest");
  return {
    ...mod,
    authenticationApi: new AuthenticationApi("http://auth-api.local"),
  };
});

vi.mock(import("@a-novel/service-authentication-rest"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    credentialsGet: vi.fn(),
    tokenCreateAnon: vi.fn(),
    claimsGet: vi.fn(),
  };
});

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
}));

vi.mock("$env/static/public", () => ({
  PUBLIC_STORYVERSE_PLATFORM_URL: "http://storyverse.local",
  PUBLIC_STUDIO_PLATFORM_URL: "http://studio.local",
  PUBLIC_AUTHENTICATION_SERVICE_URL: "http://auth-api.local",
}));

const mockClaimsGet = claimsGet as Mock;
const mockCredentialsGet = credentialsGet as Mock;

describe("/+layout", () => {
  it("renders with design system dark theme", async () => {
    const { default: Layout } = await import("./+layout.svelte");
    const { createTestSnippet } = await import("$lib/test");

    const childSnippet = createTestSnippet((() => {}) as any, {}, () => `<div>Content</div>`);

    const page = render(Layout, {
      children: childSnippet,
    });

    await waitFor(() => {
      const themeElement = page.container.querySelector("[data-theme='dark']");
      expect(themeElement).toBeInTheDocument();
    });
  });

  it("renders session loading state", async () => {
    const { default: Layout } = await import("./+layout.svelte");
    const { createTestSnippet } = await import("$lib/test");

    const childSnippet = createTestSnippet((() => {}) as any, {}, () => `<div>Content</div>`);

    const page = render(Layout, {
      children: childSnippet,
    });

    await waitFor(() => {
      expect(page.getByText(/loading user session/i)).toBeInTheDocument();
    });
  });

  it("renders navbar with login/register buttons when no session", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockResolvedValue(MockSessionAnon.claims);

    const { default: Layout } = await import("./+layout.svelte");
    const { createTestSnippet } = await import("$lib/test");

    const childSnippet = createTestSnippet((() => {}) as any, {}, () => `<div>Test Content</div>`);

    const page = render(Layout, {
      children: childSnippet,
    });

    // Wait for session loading to complete
    await waitFor(
      () => {
        expect(page.queryByText(/loading user session/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(page.queryByRole("button", { name: /register/i })).toBeInTheDocument();
      expect(page.queryByRole("button", { name: /login/i })).toBeInTheDocument();
    });
  });

  it("renders navbar with account buttons when user is authenticated", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
    mockClaimsGet.mockResolvedValue(MockSessionUser.claims);
    mockCredentialsGet.mockResolvedValue({ email: "test@example.com" });

    const { default: Layout } = await import("./+layout.svelte");
    const { createTestSnippet } = await import("$lib/test");

    const childSnippet = createTestSnippet((() => {}) as any, {}, () => `<div>Test Content</div>`);

    const page = render(Layout, {
      children: childSnippet,
    });

    // Wait for session loading to complete
    await waitFor(
      () => {
        expect(page.queryByText(/loading user session/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(page.queryByRole("button", { name: /manage account/i })).toBeInTheDocument();
      expect(page.queryByRole("button", { name: /logout/i })).toBeInTheDocument();
    });
  });

  it("renders children content without session", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockResolvedValue(MockSessionAnon.claims);

    const { default: Layout } = await import("./+layout.svelte");
    const { createTestSnippet } = await import("$lib/test");

    const childSnippet = createTestSnippet(
      (() => {}) as any,
      {},
      () => `<div data-testid="child-content">Child Content</div>`
    );

    const page = render(Layout, {
      children: childSnippet,
    });

    // Wait for session loading to complete
    await waitFor(
      () => {
        expect(page.queryByText(/loading user session/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(page.queryByTestId("child-content")).toBeInTheDocument();
      expect(page.queryByText("Child Content")).toBeInTheDocument();
    });
  });

  it("renders children content with authenticated session", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionUser));
    mockClaimsGet.mockResolvedValue(MockSessionUser.claims);
    mockCredentialsGet.mockResolvedValue({ email: "test@example.com" });

    const { default: Layout } = await import("./+layout.svelte");
    const { createTestSnippet } = await import("$lib/test");

    const childSnippet = createTestSnippet(
      (() => {}) as any,
      {},
      () => `<div data-testid="auth-child">Authenticated Content</div>`
    );

    const page = render(Layout, {
      children: childSnippet,
    });

    // Wait for session loading to complete
    await waitFor(
      () => {
        expect(page.queryByText(/loading user session/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(page.queryByTestId("auth-child")).toBeInTheDocument();
      expect(page.queryByText("Authenticated Content")).toBeInTheDocument();
    });
  });

  it("renders navbar navigation elements", async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MockSessionAnon));
    mockClaimsGet.mockResolvedValue(MockSessionAnon.claims);

    const { default: Layout } = await import("./+layout.svelte");
    const { createTestSnippet } = await import("$lib/test");

    const childSnippet = createTestSnippet((() => {}) as any, {}, () => `<div>Content</div>`);

    const page = render(Layout, {
      children: childSnippet,
    });

    // Wait for session loading to complete
    await waitFor(
      () => {
        expect(page.queryByText(/loading user session/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      // Check for navbar structure
      const navbar = page.container.querySelector("nav");
      expect(navbar).toBeInTheDocument();
    });
  });
});
