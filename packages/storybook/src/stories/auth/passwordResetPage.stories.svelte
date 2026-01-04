<script context="module" lang="ts">
  import { PasswordResetPage } from "@a-novel/package-authentication/ui";

  import Icon from "@iconify/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Auth/Pages/PasswordReset",
    component: PasswordResetPage,
    tags: ["autodocs"],
  });
</script>

<script>
  import { LOREM_IPSUM } from "@a-novel/uikit/utils";
</script>

{#snippet errorIcon()}
  <Icon icon="material-symbols:heart-broken-outline" />
{/snippet}

{#snippet empty()}
  <PasswordResetPage email="" />
{/snippet}

<Story name="Empty" template={empty} />

{#snippet filled()}
  <PasswordResetPage email="john.doe@gmail.com" />
{/snippet}

<Story name="Filled" template={filled} />

{#snippet fieldErrors()}
  <PasswordResetPage
    email="john.doe@gmail.com"
    emailStatus="invalid"
    emailStatusText={LOREM_IPSUM.SHORT}
    emailError={new TypeError(LOREM_IPSUM.SHORT)}
  />
{/snippet}

<Story name="Field errors" template={fieldErrors} />

{#snippet formSubmitting()}
  <PasswordResetPage email="john.doe@gmail.com" formStatus="validating" />
{/snippet}

<Story name="Form submitting" template={formSubmitting} />

{#snippet formError()}
  <PasswordResetPage
    email="john.doe@gmail.com"
    formStatus="invalid"
    formStatusTitle={LOREM_IPSUM.SHORTER}
    formStatusText={LOREM_IPSUM.SHORT}
    formStatusIcon={errorIcon}
    formError={new TypeError(LOREM_IPSUM.SHORT)}
  />
{/snippet}

<Story name="Form error" template={formError} />

{#snippet formSuccess()}
  <PasswordResetPage email="john.doe@gmail.com" formStatus="valid" />
{/snippet}

<Story name="Form success" template={formSuccess} />
