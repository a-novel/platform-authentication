<script lang="ts">
  import type { Component, ComponentProps, Snippet } from "svelte";
  import type { HTMLAttributes, HTMLFormAttributes } from "svelte/elements";

  import agoraLogoDark from "@a-novel/uikit/assets/logos/HD/agora (dark).png";
  import agoraLogoLight from "@a-novel/uikit/assets/logos/HD/agora (light).png";
  import { Image, Section } from "@a-novel/uikit/ui/components";
  import { ErrorBox, InfoBox } from "@a-novel/uikit/ui/components";

  import { getTranslate } from "@tolgee/svelte";

  interface FormData {
    formStatus?: "idle" | "validating" | "invalid" | "valid";

    formStatusTitle?: string;
    formStatusText?: string;
    formStatusIcon?: Snippet | Component<{}, {}, "">;

    formError?: Error;
  }

  interface Props extends Omit<HTMLFormAttributes, "title">, FormData {
    success?: Snippet;
    title: Snippet;
    wrapper?: Omit<HTMLAttributes<HTMLDivElement>, "children">;
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

  const { t } = getTranslate("auth.form");

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

<div {...wrapper} class={["wrapper", wrapper.class]}>
  <Section data-width="l" style="margin: auto">
    <div class="title">
      <Image src={agoraLogoDark} lightModeSrc={agoraLogoLight} alt={$t("logo", "Agora logo")} />
      <h1>{@render title()}</h1>
    </div>
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
      <ErrorBox data-width="l" icon={formStatusIcon} title={formStatusTitle} error={formError}>
        {formStatusText}
      </ErrorBox>
    {:else}
      <InfoBox data-width="l" icon={formStatusIcon} title={formStatusTitle} color={formInfoBoxColor}>
        {formStatusText}
      </InfoBox>
    {/if}
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    gap: var(--spacing-m);
    padding: var(--spacing-xs);

    & > :global(section) {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-xs);
      margin: 0 !important;

      & > .title {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        margin: var(--spacing-m) 0;

        & > :global(img) {
          align-self: center;
          width: auto;
          height: 4rem;
        }

        & > h1 {
          margin: 0;
          color: var(--text);
          font-size: var(--font-size-h3);
          text-align: center;
        }
      }

      & > form {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-m);
      }
    }
  }
</style>
