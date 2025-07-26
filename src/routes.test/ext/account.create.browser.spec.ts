import { MockHeadersWithAccessToken } from "#/mocks/query_client";
import { MockAccessToken } from "#/mocks/session";
import { test, expect } from "#/playwright/fixtures/base";
import { sessionAnonHandlers } from "#/utils/handlers";

import { http } from "@a-novel/nodelib/msw";
import { Screenshot } from "@a-novel/nodelib/test/e2e";

import { HttpResponse } from "msw";

const shortCode = "shortcode";
const target = "bmV3LXVzZXJAcHJvdmlkZXIuY29t"; // "new-user@provider.com" encoded in base64 URL format.
const email = "new-user@provider.com";

test.describe("create account page", () => {
  test("renders", async ({ network, page, viewport, browserName }) => {
    network.use(...sessionAnonHandlers);
    await page.goto(`/ext/account/create?shortCode=${shortCode}&target=${target}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Complete registration");

    await Screenshot(page, "create_account_page", viewport, browserName);
  });

  test("has interaction", async ({ network, page, viewport, browserName }) => {
    network.use(...sessionAnonHandlers);
    await page.goto(`/ext/account/create?shortCode=${shortCode}&target=${target}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Complete registration");

    await page.getByLabel(/Password$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).blur();

    await Screenshot(page, "create_account_page_filled", viewport, browserName);
    await expect(page.getByLabel(/Password$/)).toHaveValue("123456");
    await expect(page.getByLabel(/Password confirmation$/)).toHaveValue("123456");
    await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled();
    await Screenshot(page, "create_account_page_filled", viewport, browserName);
  });

  test("sends valid form", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .put("http://service.auth.test/credentials")
        .headers(new Headers(MockHeadersWithAccessToken("anon-access-token")), HttpResponse.error())
        .bodyJSON({ password: "123456", email, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json({ accessToken: "new-" + MockAccessToken }, { status: 200 }))
    );
    await page.goto(`/ext/account/create?shortCode=${shortCode}&target=${target}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Complete registration");

    await page.getByLabel(/Password$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).blur();

    await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled();
    await page.getByRole("button", { name: "Create account" }).click();

    await Screenshot(page, "create_account_page_success", viewport, browserName);
    await expect(page.getByRole("button", { name: "Go to dashboard" })).toBeVisible();
    await Screenshot(page, "create_account_page_success", viewport, browserName);

    await page.getByRole("button", { name: "Go to dashboard" }).click();
    await expect(page).toHaveURL("/");
  });

  test("renders link error", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .put("http://service.auth.test/credentials")
        .headers(new Headers(MockHeadersWithAccessToken("anon-access-token")), HttpResponse.error())
        .bodyJSON({ password: "123456", email, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 403 }))
    );
    await page.goto(`/ext/account/create?shortCode=${shortCode}&target=${target}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Complete registration");

    await page.getByLabel(/Password$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).blur();

    await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled();
    await page.getByRole("button", { name: "Create account" }).click();

    await Screenshot(page, "create_account_page_link_error", viewport, browserName);
    await expect(page.getByText("Invalid registration link.")).toBeVisible();
    await Screenshot(page, "create_account_page_link_error", viewport, browserName);
  });

  test("renders unexpected error", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .put("http://service.auth.test/credentials")
        .headers(new Headers(MockHeadersWithAccessToken("anon-access-token")), HttpResponse.error())
        .bodyJSON({ password: "123456", email, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 500 }))
    );
    await page.goto(`/ext/account/create?shortCode=${shortCode}&target=${target}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Complete registration");

    await page.getByLabel(/Password$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).fill("123456");
    await page.getByLabel(/Password confirmation$/).blur();

    await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled();
    await page.getByRole("button", { name: "Create account" }).click();

    await Screenshot(page, "create_account_page_error", viewport, browserName);
    await expect(page.getByText(/An unknown error prevented the account creation/)).toBeVisible();
    await Screenshot(page, "create_account_page_error", viewport, browserName);
  });
});
