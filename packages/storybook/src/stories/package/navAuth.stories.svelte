<script module lang="ts">
  import type { ComponentProps } from "svelte";

  import { NavAuth } from "@a-novel/package-authentication/ui";
  import agoraLogoDark from "@a-novel/uikit/assets/logos/integrated/agora (dark).png";
  import agoraLogoLight from "@a-novel/uikit/assets/logos/integrated/agora (light).png";
  import { NavBar, type NavItem, Section } from "@a-novel/uikit/ui/components";
  import { LOREM_IPSUM } from "@a-novel/uikit/utils";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Auth/NavAuth",
    component: NavAuth,
    tags: ["autodocs"],
    args: {},
  });

  const navItemsDefault: NavItem[] = [
    {
      content: "Link 1",
      link: window.location.href,
    },
    {
      content: "Link 2",
      link: window.location.href,
      active: true,
    },
    {
      content: "Button 1",
      action: () => {},
    },
    {
      content: "Button 2",
      action: () => {},
    },
    {
      content: "Button 3",
      action: () => {},
    },
  ];

  const dummyProps: ComponentProps<typeof NavAuth> = {
    onLogin: () => {},
    onRegister: () => {},
    onLogout: () => {},
    onManageAccount: () => {},
  };

  const credentials: ComponentProps<typeof NavAuth>["credentials"] = {
    email: "john.doe@gmail.com",
  };

  const credentialsShort: ComponentProps<typeof NavAuth>["credentials"] = {
    email: "x@y.co",
  };

  const credentialsLong: ComponentProps<typeof NavAuth>["credentials"] = {
    email: "qwertyuiopasdfghjklzxcvbnm@qwertyuiopasdfghjklzxcvbnm.com",
  };
</script>

<script>
  // Import in a separate script because the `context="module"` prevents the context functions from working properly.
  import { Image } from "@a-novel/uikit/ui/components";
  import { NavSettings } from "@a-novel/uikit/ui/components/nav";
</script>

{#snippet dummyPage()}
  <p data-width="l" style="margin: auto">
    {LOREM_IPSUM.LONG}
  </p>
  <Section data-width="l" style="margin: auto">
    {LOREM_IPSUM.LONG}
  </Section>
  <p data-width="l" style="margin: auto">
    {LOREM_IPSUM.LONG}
  </p>
  <Section data-width="l" style="margin: auto">
    {LOREM_IPSUM.LONG}
  </Section>
{/snippet}

{#snippet homeIcon()}
  <Image alt="Agora Logo" src={agoraLogoDark} lightModeSrc={agoraLogoLight} />
{/snippet}

{#snippet primary()}
  <NavBar homeLink={window.location.href} nav={navItemsDefault}>
    {#snippet homeButton()}
      {@render homeIcon()}
    {/snippet}

    {#snippet actionsDesktop()}
      <NavAuth {...dummyProps} />
      <NavSettings />
    {/snippet}

    {#snippet actionsMobile()}
      <NavSettings mobile />
      <NavAuth mobile {...dummyProps} />
    {/snippet}
  </NavBar>

  {@render dummyPage()}
{/snippet}

<Story name="Primary" template={primary} />

{#snippet withCredentials()}
  <NavBar homeLink={window.location.href} nav={navItemsDefault}>
    {#snippet homeButton()}
      {@render homeIcon()}
    {/snippet}

    {#snippet actionsDesktop()}
      <NavAuth {credentials} {...dummyProps} />
      <NavSettings />
    {/snippet}

    {#snippet actionsMobile()}
      <NavSettings mobile />
      <NavAuth mobile {credentials} {...dummyProps} />
    {/snippet}
  </NavBar>

  {@render dummyPage()}
{/snippet}

<Story name="Credentials" template={withCredentials} />

{#snippet withCredentialsShort()}
  <NavBar homeLink={window.location.href} nav={navItemsDefault}>
    {#snippet homeButton()}
      {@render homeIcon()}
    {/snippet}

    {#snippet actionsDesktop()}
      <NavAuth credentials={credentialsShort} {...dummyProps} />
      <NavSettings />
    {/snippet}

    {#snippet actionsMobile()}
      <NavSettings mobile />
      <NavAuth mobile credentials={credentialsShort} {...dummyProps} />
    {/snippet}
  </NavBar>

  {@render dummyPage()}
{/snippet}

<Story name="Credentials (short)" template={withCredentialsShort} />

{#snippet withCredentialsLong()}
  <NavBar homeLink={window.location.href} nav={navItemsDefault}>
    {#snippet homeButton()}
      {@render homeIcon()}
    {/snippet}

    {#snippet actionsDesktop()}
      <NavAuth credentials={credentialsLong} {...dummyProps} />
      <NavSettings />
    {/snippet}

    {#snippet actionsMobile()}
      <NavSettings mobile />
      <NavAuth mobile credentials={credentialsLong} {...dummyProps} />
    {/snippet}
  </NavBar>

  {@render dummyPage()}
{/snippet}

<Story name="Credentials (long)" template={withCredentialsLong} />

{#snippet credentialsLoading()}
  <NavBar homeLink={window.location.href} nav={navItemsDefault}>
    {#snippet homeButton()}
      {@render homeIcon()}
    {/snippet}

    {#snippet actionsDesktop()}
      <NavAuth credentials="loading" {...dummyProps} />
      <NavSettings />
    {/snippet}

    {#snippet actionsMobile()}
      <NavSettings mobile />
      <NavAuth credentials="loading" mobile {...dummyProps} />
    {/snippet}
  </NavBar>

  {@render dummyPage()}
{/snippet}

<Story name="Credentials (loading)" template={credentialsLoading} />

<style>
  :global(body):has(*) {
    padding: 0 !important;
  }
</style>
