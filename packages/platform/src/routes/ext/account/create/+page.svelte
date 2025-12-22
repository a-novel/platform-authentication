<script lang="ts">
  import { page } from "$app/state";
  import { authenticationApi, pageTitle } from "$lib";
  import { RegisterPageConnector } from "$lib/connectors";

  import { SvelteURLSearchParams } from "svelte/reactivity";

  import { getTranslate } from "@tolgee/svelte";

  const { t } = getTranslate("auth.platform.page.register");

  const searchParams = new SvelteURLSearchParams(page.url.searchParams);

  const shortCode = searchParams.get("shortCode") ?? "";
  const emailRaw = searchParams.get("target") ?? "";
  const email = emailRaw ? atob(emailRaw) : "";
</script>

<svelte:head>
  <title>{pageTitle($t("meta.title", "Complete registration"))}</title>
</svelte:head>

<RegisterPageConnector api={authenticationApi} {shortCode} {email} />
