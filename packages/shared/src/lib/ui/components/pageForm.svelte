<script module lang="ts">
  export type FormStatus = "idle" | "validating" | "invalid" | "valid";

  export interface FormConnectorStatus {
    status: FormStatus;
    title?: string;
    text?: string;
    iconID?: string;
    error?: Error;
  }
</script>

<script lang="ts">
  import type { Component, ComponentProps, Snippet } from "svelte";
  import type { HTMLAttributes, HTMLFormAttributes } from "svelte/elements";

  import { ErrorBox, InfoBox, Section } from "@a-novel/uikit/ui/components";

  interface Props extends Omit<HTMLFormAttributes, "title"> {
    formStatus?: FormStatus;
    formStatusTitle?: string;
    formStatusText?: string;
    formStatusIcon?: Snippet | Component<{}, {}, "">;
    formError?: Error;

    success?: Snippet;
    title: Snippet;
    wrapper?: Omit<HTMLAttributes<HTMLElement>, "children">;
  }

  let {
    wrapper = {},
    success,
    title,
    formStatus = "idle",
    formStatusTitle,
    formStatusText,
    formStatusIcon,
    formError,
    children,
    ...props
  }: Props = $props();

  let formInfoBoxColor = $derived.by<ComponentProps<typeof InfoBox>["color"]>(() => {
    switch (formStatus) {
      case "valid":
        return "primary";
      case "invalid":
        return "accent";
      default:
        return undefined;
    }
  });
</script>

<section data-width="l" {...wrapper} class={["wrapper", wrapper.class]}>
  <Section>
    {@render title()}
    {#if formStatus === "valid" && success}
      {@render success()}
    {:else}
      <form {...props}>
        {@render children?.()}
      </form>
    {/if}
  </Section>

  {#if formStatusText}
    {#if formStatus === "invalid" || formError}
      <ErrorBox icon={formStatusIcon} title={formStatusTitle} error={formError}>
        {formStatusText}
      </ErrorBox>
    {:else}
      <InfoBox icon={formStatusIcon} title={formStatusTitle} color={formInfoBoxColor}>
        {formStatusText}
      </InfoBox>
    {/if}
  {/if}
</section>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-self: center;
    gap: var(--spacing-m);
    padding: var(--spacing-xs);

    & > :global(section) {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      margin: 0;
      padding: var(--spacing-xs) var(--spacing-s);

      & > form {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-m);
      }
    }
  }
</style>
