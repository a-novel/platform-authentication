import { type Component, createRawSnippet, mount, unmount } from "svelte";

export function createTestSnippet<Props extends Record<string, any>, Exports extends Record<string, any>>(
  Component: Component<Props, Exports, any>,
  props: Props,
  render: () => string = () => `<div></div>`
) {
  return createRawSnippet(() => ({
    render,
    setup: (target) => {
      const comp = mount<Props, Exports>(Component, { target, props });
      return () => unmount(comp);
    },
  }));
}
