<script context="module" lang="ts">
  import { ManageAccountPage } from "@a-novel/platform-authentication/ui";
  import { LOREM_IPSUM } from "@a-novel/uikit/utils";

  import Icon from "@iconify/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Platform/Pages/ManageAccount",
    component: ManageAccountPage,
    tags: ["autodocs"],
  });
</script>

{#snippet errorIcon()}
  <Icon icon="material-symbols:heart-broken-outline" />
{/snippet}

{#snippet empty()}
  <ManageAccountPage />
{/snippet}

<Story name="Empty" template={empty} />

{#snippet filled()}
  <ManageAccountPage
    emailUpdateEmail="john.doe@gmail.com"
    passwordUpdateNewPassword="hackthenasa"
    passwordUpdateNewPasswordConfirmation="hackthenasa"
    passwordUpdateCurrentPassword="oldpassword123"
  />
{/snippet}

<Story name="Filled" template={filled} />

{#snippet fieldErrors()}
  <ManageAccountPage
    emailUpdateEmail="john.doe@gmail.com"
    emailUpdateEmailStatus="invalid"
    emailUpdateEmailStatusText={LOREM_IPSUM.SHORT}
    passwordUpdateNewPassword="hackthenasa"
    passwordUpdateNewPasswordConfirmation="hackthenasa"
    passwordUpdateCurrentPassword="oldpassword123"
    passwordUpdateNewPasswordConfirmationStatus="invalid"
    passwordUpdateNewPasswordConfirmationStatusText={LOREM_IPSUM.SHORT}
  />
{/snippet}

<Story name="Field errors" template={fieldErrors} />

{#snippet formSubmitting()}
  <ManageAccountPage
    emailUpdateEmail="john.doe@gmail.com"
    emailUpdateFormStatus="validating"
    passwordUpdateNewPassword="hackthenasa"
    passwordUpdateNewPasswordConfirmation="hackthenasa"
    passwordUpdateCurrentPassword="oldpassword123"
    passwordUpdateFormStatus="validating"
  />
{/snippet}

<Story name="Form submitting" template={formSubmitting} />

{#snippet formError()}
  <ManageAccountPage
    emailUpdateEmail="john.doe@gmail.com"
    emailUpdateFormStatus="invalid"
    emailUpdateFormStatusTitle={LOREM_IPSUM.SHORTER}
    emailUpdateFormStatusText={LOREM_IPSUM.SHORT}
    emailUpdateFormStatusIcon={errorIcon}
    emailUpdateFormError={new TypeError(LOREM_IPSUM.SHORT)}
    passwordUpdateNewPassword="hackthenasa"
    passwordUpdateNewPasswordConfirmation="hackthenasa"
    passwordUpdateCurrentPassword="oldpassword123"
    passwordUpdateFormStatus="invalid"
    passwordUpdateFormStatusTitle={LOREM_IPSUM.SHORTER}
    passwordUpdateFormStatusText={LOREM_IPSUM.SHORT}
    passwordUpdateFormStatusIcon={errorIcon}
    passwordUpdateFormError={new TypeError(LOREM_IPSUM.SHORT)}
  />
{/snippet}

<Story name="Form error" template={formError} />

{#snippet formSuccess()}
  <ManageAccountPage
    emailUpdateEmail="john.doe@gmail.com"
    emailUpdateFormStatus="valid"
    passwordUpdateNewPassword="hackthenasa"
    passwordUpdateNewPasswordConfirmation="hackthenasa"
    passwordUpdateCurrentPassword="oldpassword123"
    passwordUpdateFormStatus="valid"
  />
{/snippet}

<Story name="Form success" template={formSuccess} />
