import { useEffect } from "react";

import type { Decorator } from "@storybook/react-vite";
import { FormatIcu } from "@tolgee/format-icu";
import { BackendFetch, Tolgee, TolgeeProvider } from "@tolgee/react";

export const tolgee = Tolgee()
  .use(BackendFetch({ prefix: import.meta.env.VITE_TOLGEE_CDN }))
  .use(FormatIcu())
  .init({
    defaultLanguage: "en",
    fallbackLanguage: "en",
    availableLanguages: ["en", "fr"],
    defaultNs: "generic",
  });

export const TolgeeDecorator: Decorator = (Story, context) => {
  const { locale } = context.globals;

  // When the locale global changes
  useEffect(() => {
    tolgee.changeLanguage(locale).catch(console.error);
  }, [locale]);

  return (
    <TolgeeProvider tolgee={tolgee} options={{ useSuspense: true }} fallback="loading...">
      <Story {...context} />
    </TolgeeProvider>
  );
};
