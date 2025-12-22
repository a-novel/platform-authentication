<script lang="ts">
  import { page } from "$app/state";
  import { authenticationApi, pageTitle } from "$lib";
  import { PasswordResetPageConnector } from "$lib/connectors";

  import { SvelteURLSearchParams } from "svelte/reactivity";

  import { getTranslate } from "@tolgee/svelte";

  const { t } = getTranslate("auth.platform.page.passwordReset");

  const searchParams = new SvelteURLSearchParams(page.url.searchParams);

  const shortCode = $derived(searchParams.get("shortCode") ?? "");
  const userID = $derived(searchParams.get("target") ?? "");
</script>

<svelte:head>
  <title>{pageTitle($t("meta.title", "Complete password reset"))}</title>
</svelte:head>

<PasswordResetPageConnector api={authenticationApi} {shortCode} {userID} />
