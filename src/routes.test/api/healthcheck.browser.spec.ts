import { test, expect } from "#/playwright/fixtures/base";
import { sessionAnonHandlers } from "#/utils/handlers";

import { http } from "@a-novel/nodelib/msw";

import { HttpResponse } from "msw";

test.describe("healthcheck", () => {
  test("success", async ({ context, network }) => {
    network.use(
      ...sessionAnonHandlers,
      http.get("http://service.auth.test/healthcheck").resolve(() => HttpResponse.json(undefined, { status: 200 }))
    );

    await context.route("/api/healthcheck", async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.status).toBe(200);
    });
  });
});
