<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { PUBLIC_STORYVERSE_PLATFORM_URL, PUBLIC_STUDIO_PLATFORM_URL } from "$env/static/public";
  import { authenticationApi } from "$lib";
  import { loadTranslations } from "$lib/locales";

  import type { Snippet } from "svelte";

  import { SessionComponent, SessionUiComponent } from "@a-novel/package-authentication";
  import { NavAuthConnector } from "@a-novel/package-authentication/connectors";
  import { loadTranslations as loadPackageTranslations } from "@a-novel/package-authentication/locales";
  import agoraLogoDark from "@a-novel/uikit/assets/logos/integrated/agora (dark).png";
  import agoraLogoLight from "@a-novel/uikit/assets/logos/integrated/agora (light).png";
  import { TolgeeConfig } from "@a-novel/uikit/locales";
  import { DesignSystemComponent } from "@a-novel/uikit/ui";
  import { Image, NavBar, type NavItem } from "@a-novel/uikit/ui/components";
  import { NavSettings } from "@a-novel/uikit/ui/components/nav";

  import { TolgeeProvider } from "@tolgee/svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  loadTranslations(TolgeeConfig);
  loadPackageTranslations(TolgeeConfig);

  const manageAccountLink = resolve("/manage-account");
  function onManageAccount() {
    goto(manageAccountLink);
  }

  const links: NavItem[] = [
    { content: "Studio", ariaLabel: "Agora Studio", link: PUBLIC_STUDIO_PLATFORM_URL },
    { content: "Storyverse", ariaLabel: "Agora Storyverse", link: PUBLIC_STORYVERSE_PLATFORM_URL },
  ];
</script>

{#snippet homeButton()}
  <Image alt="Agora Logo" src={agoraLogoDark} lightModeSrc={agoraLogoLight} />
{/snippet}

<TolgeeProvider tolgee={TolgeeConfig}>
  <DesignSystemComponent theme="dark">
    <SessionComponent api={authenticationApi}>
      <NavBar homeLink={resolve("/")} {homeButton} nav={links}>
        {#snippet actionsDesktop()}
          <NavAuthConnector {onManageAccount} api={authenticationApi} />
          <NavSettings />
        {/snippet}
        {#snippet actionsMobile()}
          <NavAuthConnector {onManageAccount} api={authenticationApi} mobile />
          <NavSettings mobile />
        {/snippet}
      </NavBar>
      <SessionUiComponent api={authenticationApi}>
        {@render children()}
      </SessionUiComponent>
    </SessionComponent>
  </DesignSystemComponent>
</TolgeeProvider>
