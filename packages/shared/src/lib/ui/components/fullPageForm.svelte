<script lang="ts">
  import { PageForm } from "$lib/ui/components";

  import type { ComponentProps } from "svelte";

  import agoraLogoDark from "@a-novel/uikit/assets/logos/HD/agora (dark).png";
  import agoraLogoLight from "@a-novel/uikit/assets/logos/HD/agora (light).png";
  import { Image } from "@a-novel/uikit/ui/components";

  import { getTranslate } from "@tolgee/svelte";

  let { title: textTitle, wrapper, ...props }: ComponentProps<typeof PageForm> = $props();

  const { t } = getTranslate("auth.form");
</script>

<span style="display: none"></span>
<PageForm {...props} wrapper={{ ...wrapper, class: ["wrapper", wrapper?.class] }}>
  {#snippet title()}
    <div class="title">
      <Image src={agoraLogoDark} lightModeSrc={agoraLogoLight} alt={$t("logo", "Agora logo")} />
      {@render textTitle()}
    </div>
  {/snippet}
</PageForm>

<style>
  span + :global(.wrapper) {
    flex-grow: 1;
    justify-content: center;
    margin: auto;
  }

  .title {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin: var(--spacing-m) 0;
    text-align: center;

    & > :global(img) {
      align-self: center;
      width: auto;
      height: 4rem;
    }

    & > :global(:is(h1, h2, h3, h4, h5, h6)) {
      margin: 0;
      color: var(--text);
      font-size: var(--font-size-h3);
      text-align: center;
    }
  }
</style>
