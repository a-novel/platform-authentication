<script context="module" lang="ts">
  import { LoginPage } from "@a-novel/package-authentication/ui";

  import Icon from "@iconify/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Auth/Pages/Login",
    component: LoginPage,
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
  <LoginPage email="" password="" />
{/snippet}

<Story name="Empty" template={empty} />

{#snippet filled()}
  <LoginPage email="john.doe@gmail.com" password="hackthenasa" />
{/snippet}

<Story name="Filled" template={filled} />

{#snippet validating()}
  <LoginPage email="john.doe@gmail.com" password="hackthenasa" emailStatus="validating" />
{/snippet}

<Story name="Validating" template={validating} />

{#snippet validationSuccess()}
  <LoginPage
    email="john.doe@gmail.com"
    password="hackthenasa"
    emailStatus="valid"
    emailStatusText={LOREM_IPSUM.SHORT}
  />
{/snippet}

<Story name="Validation success" template={validationSuccess} />

{#snippet fieldErrors()}
  <LoginPage
    email="john.doe@gmail.com"
    password="hackthenasa"
    emailStatus="invalid"
    passwordStatus="invalid"
    emailStatusText={LOREM_IPSUM.SHORT}
    passwordStatusText={LOREM_IPSUM.SHORT}
    emailError={new TypeError(LOREM_IPSUM.SHORT)}
    passwordError={new TypeError(LOREM_IPSUM.SHORT)}
  />
{/snippet}

<Story name="Field errors" template={fieldErrors} />

{#snippet formError()}
  <LoginPage
    email="john.doe@gmail.com"
    password="hackthenasa"
    formStatus="invalid"
    formStatusTitle={LOREM_IPSUM.SHORTER}
    formStatusText={LOREM_IPSUM.SHORT}
    formStatusIcon={errorIcon}
    formError={new TypeError(LOREM_IPSUM.SHORT)}
  />
{/snippet}

<Story name="Form error" template={formError} />

{#snippet formSuccess()}
  <LoginPage email="john.doe@gmail.com" password="hackthenasa" formStatus="valid" />
{/snippet}

<Story name="Form success" template={formSuccess} />
