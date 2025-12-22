<script lang="ts">
  import { StatusPage } from "@a-novel/uikit/ui/components";
  import { StatusPageInternalError, StatusPageLoading } from "@a-novel/uikit/ui/components/statusPages";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";

  interface Props {
    status: "loading" | "success" | "error" | "internal-error";
    error?: Error;
    email: string;
  }

  let { status, error, email }: Props = $props();

  const { t } = getTranslate("auth.platform.page.validateEmail");
</script>

{#if status === "loading"}
  <StatusPageLoading>
    {$t("page.loading.content", "Validating email...")}
  </StatusPageLoading>
{:else if status === "success"}
  <StatusPage color="primary">
    {#snippet icon()}
      <Icon icon="material-symbols:mark-email-read-outline" />
    {/snippet}

    {#snippet title()}
      {$t("page.success.title", "Email validated successfully!")}
    {/snippet}

    {@html $t(
      "page.success.content",
      "Your email <strong>{email}</strong> has been validated successfully. You can now use it to log in.",
      { email }
    )}
  </StatusPage>
{:else if status === "error"}
  <StatusPage color="accent">
    {#snippet icon()}
      <Icon icon="material-symbols:mail-off-outline" />
    {/snippet}

    {#snippet title()}
      {$t("page.error.title", "Email validation failed.")}
    {/snippet}

    {@html $t(
      "page.error.content",
      "We were unable to validate your email <strong>{email}</strong>. The validation link may have expired or is invalid, or you have already validated this address.",
      { email }
    )}
  </StatusPage>
{:else}
  <StatusPageInternalError {error} />
{/if}
