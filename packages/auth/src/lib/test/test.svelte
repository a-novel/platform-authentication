<script lang="ts">
  interface Props {
    callback: () => void;
  }

  let { callback }: Props = $props();
  $effect(() => {
    callback();
  });
</script>
