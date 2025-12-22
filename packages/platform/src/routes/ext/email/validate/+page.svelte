<script lang="ts">
  import { page } from "$app/state";
  import { authenticationApi, pageTitle } from "$lib";
  import { ValidateEmailPageConnector } from "$lib/connectors";

  import { SvelteURLSearchParams } from "svelte/reactivity";

  import { getTranslate } from "@tolgee/svelte";

  const { t } = getTranslate("auth.platform.page.validateEmail");

  const searchParams = new SvelteURLSearchParams(page.url.searchParams);

  const shortCode = $derived(searchParams.get("shortCode") ?? "");
  const userID = $derived(searchParams.get("target") ?? "");
  const emailRaw = searchParams.get("source") ?? "";
  const email = emailRaw ? atob(emailRaw) : "";
</script>

<svelte:head>
  <title>{pageTitle($t("meta.title", "Validate email"))}</title>
</svelte:head>

<ValidateEmailPageConnector api={authenticationApi} {shortCode} {userID} {email} />
