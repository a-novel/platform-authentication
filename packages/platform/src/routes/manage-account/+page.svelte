<script lang="ts">
  import { authenticationApi, pageTitle } from "$lib";
  import { ManageAccountPageConnector } from "$lib/connectors";

  import { ProtectedPage } from "@a-novel/package-authentication";

  import { getTranslate } from "@tolgee/svelte";

  const { t } = getTranslate("auth.platform.page.manageAccount");
</script>

<svelte:head>
  <title>{pageTitle($t("meta.title", "Account management"))}</title>
</svelte:head>

<ProtectedPage>
  <ManageAccountPageConnector api={authenticationApi} />
</ProtectedPage>
