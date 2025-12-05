<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";

  import { loadTranslations } from "@a-novel/package-authentication/locales";
  import type { LNG } from "@a-novel/uikit/const";
  import { TolgeeConfig } from "@a-novel/uikit/locales";
  import { LocaleSyncComponent } from "@a-novel/uikit/storybook";
  import { DesignSystemComponent } from "@a-novel/uikit/ui";

  import { TolgeeProvider } from "@tolgee/svelte";

  interface Props {
    theme: ComponentProps<typeof DesignSystemComponent>["theme"];
    locale: LNG;
    children: Snippet;
  }

  let { children, theme, locale }: Props = $props();

  loadTranslations(TolgeeConfig);
</script>

<TolgeeProvider tolgee={TolgeeConfig}>
  <LocaleSyncComponent {locale} />
  <DesignSystemComponent {theme}>
    {@render children?.()}
  </DesignSystemComponent>
</TolgeeProvider>
