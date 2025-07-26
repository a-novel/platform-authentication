import banner from "~/assets/images/banner.png";

import { AuthNav, type AuthNavProps, useAuthNavConnector } from "@a-novel/package-authenticator";
import { TolgeeLangMetadata, type TolgeeSupportedLanguages } from "@a-novel/package-ui/translations";

import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import { useTolgee } from "@tolgee/react";

export function AppLayout({ children, connector }: { children: ReactNode; connector: AuthNavProps["connector"] }) {
  const tolgee = useTolgee();

  return (
    <>
      <AuthNav<typeof TolgeeSupportedLanguages, typeof Link, typeof Link>
        connector={connector}
        homeButton={{
          component: Link,
          to: "/",
          icon: banner,
        }}
        account={{
          component: Link,
          to: "/account",
        }}
        lang={{
          langs: TolgeeLangMetadata,
          selectedLang: (tolgee.getLanguage() ?? tolgee.getPendingLanguage()) as
            | (typeof TolgeeSupportedLanguages)[number]
            | undefined,
          onChange: tolgee.changeLanguage,
        }}
      />
      {children}
    </>
  );
}

export function DefaultAppLayout({ children }: { children: ReactNode }) {
  return <AppLayout connector={useAuthNavConnector()}>{children}</AppLayout>;
}
