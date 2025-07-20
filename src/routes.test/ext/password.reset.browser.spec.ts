import { MockHeadersWithAccessToken } from "#/mocks/query_client";
import { MockAccessToken } from "#/mocks/session";
import { test, expect } from "#/playwright/fixtures/base";
import { sessionAnonHandlers } from "#/utils/handlers";

import { http } from "@a-novel/nodelib/msw";
import { Screenshot } from "@a-novel/nodelib/test/e2e";

import { HttpResponse } from "msw";

const shortCode = "shortcode";
const userID = "94b4d288-dbff-4eca-805a-f45311a34e15";

test.describe("reset password page", () => {
  test("renders", async ({ network, page, viewport, browserName }) => {
    network.use(...sessionAnonHandlers);
    await page.goto(`/ext/password/reset?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Password reset");

    await Screenshot(page, "reset_password_page", viewport, browserName);
  });

  test("has interaction", async ({ network, page, viewport, browserName }) => {
    network.use(...sessionAnonHandlers);
    await page.goto(`/ext/password/reset?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Password reset");

    await page.getByLabel(/New password$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).blur();

    await Screenshot(page, "reset_password_page_filled", viewport, browserName);
    await expect(page.getByLabel(/New password$/)).toHaveValue("123456");
    await expect(page.getByLabel(/New password confirmation$/)).toHaveValue("123456");
    await expect(page.getByRole("button", { name: "Update password" })).toBeEnabled();
    await Screenshot(page, "reset_password_page_filled", viewport, browserName);
  });

  test("sends valid form", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .patch("http://service.auth.test/credentials/password/reset")
        .headers(new Headers(MockHeadersWithAccessToken("anon-access-token")), HttpResponse.error())
        .bodyJSON({ password: "123456", userID, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json({ accessToken: "new-" + MockAccessToken }, { status: 200 }))
    );
    await page.goto(`/ext/password/reset?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Password reset");

    await page.getByLabel(/New password$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).blur();

    await expect(page.getByRole("button", { name: "Update password" })).toBeEnabled();
    await page.getByRole("button", { name: "Update password" }).click();

    await Screenshot(page, "reset_password_page_success", viewport, browserName);
    await expect(page.getByText("Password updated!")).toBeVisible();
  });

  test("renders link error", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .patch("http://service.auth.test/credentials/password/reset")
        .headers(new Headers(MockHeadersWithAccessToken("anon-access-token")), HttpResponse.error())
        .bodyJSON({ password: "123456", userID, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 403 }))
    );
    await page.goto(`/ext/password/reset?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Password reset");

    await page.getByLabel(/New password$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).blur();

    await expect(page.getByRole("button", { name: "Update password" })).toBeEnabled();
    await page.getByRole("button", { name: "Update password" }).click();

    await Screenshot(page, "reset_password_page_link_error", viewport, browserName);
    await expect(page.getByText("Invalid password reset link.")).toBeVisible();
    await Screenshot(page, "reset_password_page_link_error", viewport, browserName);
  });

  test("renders unexpected error", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .patch("http://service.auth.test/credentials/password/reset")
        .headers(new Headers(MockHeadersWithAccessToken("anon-access-token")), HttpResponse.error())
        .bodyJSON({ password: "123456", userID, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 500 }))
    );
    await page.goto(`/ext/password/reset?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Password reset");

    await page.getByLabel(/New password$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).fill("123456");
    await page.getByLabel(/New password confirmation$/).blur();

    await expect(page.getByRole("button", { name: "Update password" })).toBeEnabled();
    await page.getByRole("button", { name: "Update password" }).click();

    await Screenshot(page, "reset_password_page_error", viewport, browserName);
    await expect(page.getByText(/An unknown error prevented the password update/)).toBeVisible();
    await Screenshot(page, "reset_password_page_error", viewport, browserName);
  });
});
