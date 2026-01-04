<script lang="ts">
  import type { Snippet } from "svelte";

  import { loadTranslations as loadPackageTranslations } from "@a-novel/package-authentication/locales";
  import { loadTranslations as loadPlatformTranslations } from "@a-novel/platform-authentication/locales";

  import { getTolgee } from "@tolgee/svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  const tolgee = getTolgee();

  loadPackageTranslations($tolgee);
  loadPlatformTranslations($tolgee);
</script>

{@render children?.()}
