import type { Decorator } from "@storybook/react-vite";
import { createRouter, createRootRoute, RouterProvider } from "@tanstack/react-router";

export const RouterDecorator: Decorator = (Story) => {
  const routeTree = createRootRoute({ component: () => <Story /> });
  const router = createRouter({ routeTree });
  return <RouterProvider router={router} />;
};
