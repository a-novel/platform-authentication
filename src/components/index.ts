import { DefaultAppLayout } from "~/components/layout";

import { DefaultSessionProvider } from "@a-novel/package-authenticator";
import {
  DefaultErrorComponent,
  DefaultNotFoundComponent,
  DefaultRootComponent,
  useOverrideRouteMetaDescription,
  useOverrideRouteMetaTitle,
} from "@a-novel/package-ui/tanstack/start";

export const RootComponent = DefaultRootComponent({
  wrapper: DefaultSessionProvider({
    layout: DefaultAppLayout,
    useOverrideRouteMetaTitle,
    useOverrideRouteMetaDescription,
  }),
});

export const ErrorComponent = DefaultErrorComponent({
  ns: "generic",
  metadata: {
    titleKey: "nav.error.metadata.title",
  },
  page: {
    titleKey: "nav.error.title",
    contentKey: "nav.error.content",
  },
});

export const NotFoundComponent = DefaultNotFoundComponent({
  ns: "generic",
  metadata: {
    titleKey: "nav.notFound.metadata.title",
  },
  page: {
    titleKey: "nav.notFound.title",
    contentKey: "nav.notFound.content",
  },
});
