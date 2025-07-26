import { AuthenticatedStorageState, expect, test } from "#/playwright/fixtures/base";
import { sessionAnonHandlers, sessionAuthenticatedHandlers } from "#/utils/handlers";

import { Screenshot } from "@a-novel/nodelib/test/e2e";

test.describe("home page", () => {
  test("requires authentication", async ({ network, page, viewport, browserName }) => {
    network.use(...sessionAnonHandlers);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();

    await Screenshot(page, "home_page_unauthenticated", viewport, browserName);
  });

  test.describe(() => {
    test.use({
      storageState: async ({ baseURL }, douse) => {
        await douse(AuthenticatedStorageState(baseURL!));
      },
    });

    test("render applications", async ({ page, network, viewport, browserName }) => {
      network.use(...sessionAuthenticatedHandlers);
      await page.goto("/");

      await expect(page.getByRole("heading", { level: 2, name: "Agora apps" })).toBeVisible();
      await page.getByRole("heading", { level: 2, name: "Agora apps" }).scrollIntoViewIfNeeded();

      await Screenshot(page, "home_page_apps", viewport, browserName);

      await expect(page.locator(`[href*="http://app.studio"]`)).toBeVisible();
      await page.locator(`[href*="http://app.studio"]`).scrollIntoViewIfNeeded();

      await Screenshot(page, "home_page_apps", viewport, browserName);
    });
  });
});
