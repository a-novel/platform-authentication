import { peerDependencies } from "./package.json";

import os from "node:os";
import path from "node:path";

import { defineConfig } from "vitest/config";

import { sveltekit } from "@sveltejs/kit/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { CookieJar } from "jsdom";

const baseResolve = process.env.VITEST
  ? {
      conditions: ["browser"],
    }
  : {};

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  build: {
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(peerDependencies),
    },
  },
  resolve: { ...baseResolve, dedupe: ["svelte"] },
  test: {
    expect: { requireAssertions: true },
    environmentOptions: {
      cookieJar: new CookieJar(undefined, { allowSpecialUseDomain: true }),
    },
    coverage: {
      enabled: true,
      clean: true,
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx,svelte}"],
      exclude: ["**/*.d.ts"],
    },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          globals: true,
          name: "client",
          environment: "jsdom",
          setupFiles: ["./vitest-setup-client.js"],
          execArgv: ["--localstorage-file", path.resolve(os.tmpdir(), `vitest-${process.pid}.localstorage`)],
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.server.{test,spec}.{js,ts}"],
        },
      },
      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.server.{test,spec}.{js,ts}"],
        },
      },
    ],
  },
});
