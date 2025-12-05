<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";

  import { ErrorBox, InfoBox, Input } from "@a-novel/uikit/ui/components";

  interface Props extends ComponentProps<typeof Input> {
    status?: "idle" | "validating" | "invalid" | "valid";
    statusText?: string;
    error?: Error;
    helper?: Snippet;
    label: Snippet;
  }

  let {
    value = $bindable(""),
    status = "idle",
    statusText,
    error,
    name,
    id = name,
    label,
    helper,
    ...props
  }: Props = $props();

  let color = $derived<ComponentProps<typeof Input>["color"]>(status === "invalid" ? "accent" : undefined);

  let infoBoxColor = $derived.by<ComponentProps<typeof InfoBox>["color"]>(() => {
    switch (status) {
      case "valid":
        return "primary";
      case "invalid":
        return "accent";
      default:
        return undefined;
    }
  });
</script>

<div>
  <div class="label-helper">
    <label for={id} data-required={props.required}>
      {@render label()}
    </label>
    {#if helper}
      <div class="helper">
        {@render helper()}
      </div>
    {/if}
  </div>
  <Input {...props} bind:value {id} {name} {color} data-status={status} />
  {#if statusText}
    {#if status === "invalid" || error}
      <ErrorBox data-infobox="true" {error}>
        {statusText}
      </ErrorBox>
    {:else}
      <InfoBox data-infobox="true" color={infoBoxColor}>
        {statusText}
      </InfoBox>
    {/if}
  {/if}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);

    & > :global([data-infobox="true"]) {
      margin-top: var(--spacing-s);
    }

    & > .label-helper {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-xxs);

      & > .helper {
        color: var(--color-gray-600);
        font-style: italic;
        font-size: var(--font-size-s);
      }

      & > label {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--spacing-s);
        color: var(--color-gray-900);
        font-size: var(--font-size-s);

        &[data-required="true"]::after {
          content: " *";
          color: var(--color-accent-400);
        }

        & > :global(svg) {
          /* Visual alignment */
          margin-top: -0.125lh;
          width: auto;
          height: 1lh;
          color: inherit;
        }
      }
    }
  }
</style>
