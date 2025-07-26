import { MockHeadersWithAccessToken } from "#/mocks/query_client";
import { MockCurrentUser, MockSession } from "#/mocks/session";
import { AuthenticatedStorageState, test, expect } from "#/playwright/fixtures/base";
import { sessionAnonHandlers, sessionAuthenticatedHandlers } from "#/utils/handlers";

import { LangEnum } from "@a-novel/connector-authentication/api";
import { http } from "@a-novel/nodelib/msw";
import { Screenshot } from "@a-novel/nodelib/test/e2e";

import { HttpResponse } from "msw";

test.describe("account page", () => {
  test("requires authentication", async ({ network, page, viewport, browserName }) => {
    network.use(...sessionAnonHandlers);
    await page.goto("/account");
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();

    await Screenshot(page, "account_page_unauthenticated", viewport, browserName);
  });

  test.describe(() => {
    test.use({
      storageState: async ({ baseURL }, douse) => {
        await douse(AuthenticatedStorageState(baseURL!));
      },
    });

    test("renders", async ({ page, network, viewport, browserName }) => {
      network.use(...sessionAuthenticatedHandlers);

      await page.goto("/account");

      await Screenshot(page, "account_page", viewport, browserName);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("My account");
      await Screenshot(page, "account_page", viewport, browserName);
    });

    test.describe("update password", () => {
      test("has interaction", async ({ network, page, viewport, browserName }) => {
        network.use(...sessionAuthenticatedHandlers);

        await page.goto("/account");

        await expect(page.getByRole("heading", { level: 2, name: "My password" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Update password" })).toBeVisible();
        await page.getByRole("button", { name: "Update password" }).scrollIntoViewIfNeeded();

        await page.getByLabel(/Current password$/).fill("123456");
        await page.getByLabel(/New password$/).fill("654321");
        await page.getByLabel(/New password confirmation$/).fill("654321");
        await page.getByLabel(/New password confirmation$/).blur();

        await Screenshot(page, "account_page_update_password_filled", viewport, browserName);

        await expect(page.getByLabel(/Current password$/)).toHaveValue("123456");
        await expect(page.getByLabel(/New password$/)).toHaveValue("654321");
        await expect(page.getByLabel(/New password confirmation$/)).toHaveValue("654321");

        await Screenshot(page, "account_page_update_password_filled", viewport, browserName);

        await expect(page.getByRole("button", { name: "Update password" })).toBeEnabled();
      });

      test("sends valid form", async ({ network, page, viewport, browserName }) => {
        network.use(
          ...sessionAuthenticatedHandlers,
          http
            .patch("http://service.auth.test/credentials/password")
            .headers(new Headers(MockHeadersWithAccessToken(MockSession.session!.accessToken!)), HttpResponse.error())
            .bodyJSON(
              {
                currentPassword: "123456",
                password: "654321",
                passwordConfirmation: "654321",
              },
              HttpResponse.error()
            )
            .resolve(() => HttpResponse.json(undefined, { status: 200 }))
        );

        await page.goto("/account");

        await expect(page.getByRole("heading", { level: 2, name: "My password" })).toBeVisible();
        await page.getByRole("button", { name: "Update password" }).scrollIntoViewIfNeeded();

        await page.getByLabel(/Current password$/).fill("123456");
        await page.getByLabel(/New password$/).fill("654321");
        await page.getByLabel(/New password confirmation$/).fill("654321");
        await page.getByLabel(/New password confirmation$/).blur();

        await expect(page.getByRole("button", { name: "Update password" })).toBeEnabled();

        await page.getByRole("button", { name: "Update password" }).click();

        await Screenshot(page, "account_page_update_password_success", viewport, browserName);
        await expect(page.getByRole("button", { name: "Got it" })).toBeVisible();
        await Screenshot(page, "account_page_update_password_success", viewport, browserName);

        await page.getByRole("button", { name: "Got it" }).click();

        // The button should be gone after clicking.
        await expect(page.getByRole("button", { name: "Got it" })).not.toBeVisible();

        // Inputs should be cleared.
        await Screenshot(page, "account_page_update_password_success_modal_closed", viewport, browserName);
        await expect(page.getByLabel(/Current password$/)).toHaveValue("");
        await expect(page.getByLabel(/New password$/)).toHaveValue("");
        await expect(page.getByLabel(/New password confirmation$/)).toHaveValue("");
      });
    });

    test.describe("request email update", () => {
      test("has interaction", async ({ network, page, viewport, browserName }) => {
        network.use(...sessionAuthenticatedHandlers);

        await page.goto("/account");

        await expect(page.getByRole("heading", { level: 2, name: "My email" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Request email update" })).toBeVisible();
        await page.getByRole("button", { name: "Request email update" }).scrollIntoViewIfNeeded();

        await Screenshot(page, "account_page_request_email_update_default", viewport, browserName);

        await expect(page.getByLabel(/Email$/)).toHaveValue(MockCurrentUser.email);
        await page.getByLabel(/Email$/).fill("new-" + MockCurrentUser.email);

        await expect(page.getByLabel(/Email$/)).toHaveValue("new-" + MockCurrentUser.email);

        await Screenshot(page, "account_page_request_email_update_filled", viewport, browserName);

        await expect(page.getByRole("button", { name: "Request email update" })).toBeEnabled();
      });

      test("sends valid form", async ({ network, page, viewport, browserName }) => {
        network.use(
          ...sessionAuthenticatedHandlers,
          http
            .put("http://service.auth.test/short-code/update-email")
            .headers(new Headers(MockHeadersWithAccessToken(MockSession.session!.accessToken!)), HttpResponse.error())
            .bodyJSON({ email: "new-" + MockCurrentUser.email, lang: LangEnum.En }, HttpResponse.error())
            .resolve(() => HttpResponse.json(undefined, { status: 204 }))
        );

        await page.goto("/account");

        await expect(page.getByRole("heading", { level: 2, name: "My email" })).toBeVisible();
        await page.getByRole("button", { name: "Request email update" }).scrollIntoViewIfNeeded();

        await Screenshot(page, "account_page_request_email_update_default", viewport, browserName);

        await expect(page.getByLabel(/Email$/)).toHaveValue(MockCurrentUser.email);
        await page.getByLabel(/Email$/).fill("new-" + MockCurrentUser.email);

        await expect(page.getByLabel(/Email$/)).toHaveValue("new-" + MockCurrentUser.email);

        await Screenshot(page, "account_page_request_email_update_filled", viewport, browserName);

        await expect(page.getByRole("button", { name: "Request email update" })).toBeEnabled();

        await page.getByRole("button", { name: "Request email update" }).click();

        await Screenshot(page, "account_page_request_email_update_success", viewport, browserName);
        await expect(page.getByRole("button", { name: "Got it" })).toBeVisible();
        await Screenshot(page, "account_page_request_email_update_success", viewport, browserName);

        await page.getByRole("button", { name: "Got it" }).click();

        // The button should be gone after clicking.
        await expect(page.getByRole("button", { name: "Got it" })).not.toBeVisible();
        // Input should be cleared.
        await Screenshot(page, "account_page_request_email_update_success_modal_closed", viewport, browserName);
        await expect(page.getByLabel(/Email$/)).toHaveValue(MockCurrentUser.email);
      });
    });
  });
});
