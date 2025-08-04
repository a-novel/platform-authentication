import { MockHeadersWithAccessToken } from "#/mocks/query_client";
import { MockAccessToken } from "#/mocks/session";
import { test, expect } from "#/playwright/fixtures/base";
import { sessionAnonHandlers } from "#/utils/handlers";

import { http } from "@a-novel/nodelib/msw";
import { Screenshot } from "@a-novel/nodelib/test/e2e";

import { HttpResponse } from "msw";

const shortCode = "shortcode";
const userID = "94b4d288-dbff-4eca-805a-f45311a34e15";

test.describe("validate email page", () => {
  test("renders success", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .patch("http://service.auth.test/credentials/email")
        .headers(new Headers(MockHeadersWithAccessToken(MockAccessToken)), HttpResponse.error())
        .bodyJSON({ userID, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json({ email: "new-email@provider.com" }, { status: 200 }))
    );
    await page.goto(`/ext/email/validate?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Email validated!");

    await Screenshot(page, "validate_email_page", viewport, browserName);

    // Check metadata.
    await expect(page).toHaveTitle("Email validation | Agora Social");
  });

  test("renders link error", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .patch("http://service.auth.test/credentials/email")
        .headers(new Headers(MockHeadersWithAccessToken(MockAccessToken)), HttpResponse.error())
        .bodyJSON({ userID, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json({ email: "new-email@provider.com" }, { status: 403 }))
    );
    await page.goto(`/ext/email/validate?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Invalid email validation link.");

    await Screenshot(page, "validate_email_page_link_error", viewport, browserName);
  });

  test("renders error", async ({ network, page, viewport, browserName }) => {
    network.use(
      ...sessionAnonHandlers,
      http
        .patch("http://service.auth.test/credentials/email")
        .headers(new Headers(MockHeadersWithAccessToken(MockAccessToken)), HttpResponse.error())
        .bodyJSON({ userID, shortCode }, HttpResponse.error())
        .resolve(() => HttpResponse.json({ email: "new-email@provider.com" }, { status: 500 }))
    );
    await page.goto(`/ext/email/validate?shortCode=${shortCode}&target=${userID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Failed to validate email.");

    await Screenshot(page, "validate_email_page_error", viewport, browserName);
  });
});
