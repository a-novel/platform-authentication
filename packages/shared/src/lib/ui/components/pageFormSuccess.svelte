<script lang="ts">
  import type { Snippet } from "svelte";

  import { CheckIcon } from "@a-novel/uikit/ui/icons";

  interface Props {
    message: Snippet;
    title?: Snippet;
    sub?: Snippet;
  }

  let { message, sub, title }: Props = $props();
</script>

<div class="success">
  <span class="success-icon">
    <CheckIcon color="primary" />
  </span>
  {#if title}
    <h6>
      {@render title()}
    </h6>
  {/if}
  <p class="success-message">
    {@render message()}
  </p>
  {#if sub}
    <p class="success-message-sub">
      {@render sub()}
    </p>
  {/if}
</div>

<style>
  .success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xxs);
    margin-bottom: var(--spacing-s);

    & > h6 {
      margin-bottom: var(--spacing-m);
      font-size: var(--font-size-h4);
      text-align: center;
    }

    & > .success-icon {
      margin-bottom: var(--spacing-s);
      color: var(--color-primary);
      font-size: 4rem;
    }

    & > .success-message {
      margin: 0;
      color: var(--color-primary);
      font-weight: bold;
      font-size: var(--font-size-h6);
      text-align: center;

      & > :global(strong) {
        color: var(--text);
      }
    }

    & > .success-message-sub {
      margin: 0;
      color: var(--color-gray-600);
      font-size: var(--font-size-p);
      text-align: center;
    }
  }
</style>
