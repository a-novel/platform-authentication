/// <reference types="@vitest/browser/matchers" />
import "@testing-library/jest-dom/vitest";

// Mock ResizeObserver for components that use it (e.g., NavBar)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
