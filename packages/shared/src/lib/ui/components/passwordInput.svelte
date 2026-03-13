<script lang="ts">
  import { TextInput } from "$lib/ui/components";

  import type { ComponentProps } from "svelte";

  import { Button } from "@a-novel/uikit/ui/components";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";

  let { endAdornment, value = $bindable(""), ...props }: Omit<ComponentProps<typeof TextInput>, "type"> = $props();

  let revealPassword = $state(false);

  function toggleRevealPassword() {
    revealPassword = !revealPassword;
  }

  const { t } = getTranslate("auth.component.input");
</script>

<TextInput {value} {...props} type={revealPassword ? "text" : "password"}>
  {#snippet endAdornment()}
    {@render endAdornment?.()}

    <Button
      aria-label={revealPassword
        ? $t("field.password.aria.hide", "Hide password")
        : $t("field.password.aria.reveal", "Reveal password")}
      color={revealPassword ? "primary" : "invert"}
      raw
      icon
      onclick={toggleRevealPassword}
      type="button"
    >
      <Icon icon={revealPassword ? "material-symbols:password-2" : "material-symbols:password-2-off"} />
    </Button>
  {/snippet}
</TextInput>
