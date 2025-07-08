import banner from "~/assets/images/banner.png";

import { useAuthNavConnector } from "@a-novel/package-authenticator";
import { AgoraDefaultLayout } from "@a-novel/tanstack-start-config";

import type { FC, ReactNode } from "react";

import { Link } from "@tanstack/react-router";

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const connector = useAuthNavConnector();
  return (
    <AgoraDefaultLayout<typeof Link>
      authConnector={connector}
      banner={banner}
      links={{
        account: {
          component: Link,
          to: "/account",
        },
      }}
    >
      {children}
    </AgoraDefaultLayout>
  );
};
