<script context="module" lang="ts">
  import { PasswordResetPage } from "@a-novel/platform-authentication/ui";
  import { LOREM_IPSUM } from "@a-novel/uikit/utils";

  import Icon from "@iconify/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Platform/Pages/PasswordReset",
    component: PasswordResetPage,
    tags: ["autodocs"],
  });
</script>

{#snippet errorIcon()}
  <Icon icon="material-symbols:heart-broken-outline" />
{/snippet}

{#snippet empty()}
  <PasswordResetPage password="" passwordConfirmation="" />
{/snippet}

<Story name="Empty" template={empty} />

{#snippet filled()}
  <PasswordResetPage password="hackthenasa" passwordConfirmation="hackthenasa" />
{/snippet}

<Story name="Filled" template={filled} />

{#snippet fieldErrors()}
  <PasswordResetPage
    password="hackthenasa"
    passwordConfirmation="hackthenasa"
    passwordConfirmationStatus="invalid"
    passwordConfirmationStatusText={LOREM_IPSUM.SHORT}
  />
{/snippet}

<Story name="Field errors" template={fieldErrors} />

{#snippet formSubmitting()}
  <PasswordResetPage password="hackthenasa" passwordConfirmation="hackthenasa" formStatus="validating" />
{/snippet}

<Story name="Form submitting" template={formSubmitting} />

{#snippet formError()}
  <PasswordResetPage
    password="hackthenasa"
    passwordConfirmation="hackthenasa"
    formStatus="invalid"
    formStatusTitle={LOREM_IPSUM.SHORTER}
    formStatusText={LOREM_IPSUM.SHORT}
    formStatusIcon={errorIcon}
    formError={new TypeError(LOREM_IPSUM.SHORT)}
  />
{/snippet}

<Story name="Form error" template={formError} />

{#snippet formSuccess()}
  <PasswordResetPage password="hackthenasa" passwordConfirmation="hackthenasa" formStatus="valid" />
{/snippet}

<Story name="Form success" template={formSuccess} />
