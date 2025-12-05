<script lang="ts">
  import { SessionComponent } from "$lib";
  import { loadTranslations } from "$lib/locales";

  import type { Snippet } from "svelte";

  import type { AuthenticationApi } from "@a-novel/service-authentication-rest";
  import { TolgeeConfig } from "@a-novel/uikit/locales";
  import { DesignSystemComponent } from "@a-novel/uikit/ui";

  import { TolgeeProvider } from "@tolgee/svelte";

  interface Props {
    api: AuthenticationApi;
    children: Snippet;
  }

  let { api, children }: Props = $props();

  loadTranslations(TolgeeConfig);
</script>

<TolgeeProvider tolgee={TolgeeConfig}>
  <DesignSystemComponent theme="dark">
    <SessionComponent {api}>
      {@render children()}
    </SessionComponent>
  </DesignSystemComponent>
</TolgeeProvider>
