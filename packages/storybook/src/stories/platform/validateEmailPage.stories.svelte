<script context="module" lang="ts">
  import { ValidateEmailPage } from "@a-novel/platform-authentication/ui";
  import { LOREM_IPSUM } from "@a-novel/uikit/utils";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Platform/Pages/ValidateEmail",
    component: ValidateEmailPage,
    tags: ["autodocs"],
  });
</script>

<Story name="Loading" args={{ status: "loading", email: "john.doe@gmail.com" }} />

<Story name="Success" args={{ status: "success", email: "john.doe@gmail.com" }} />

<Story name="Error" args={{ status: "error", email: "john.doe@gmail.com" }} />

<Story
  name="Internal Error"
  args={{ status: "internal-error", email: "john.doe@gmail.com", error: new Error(LOREM_IPSUM.SHORT) }}
/>
