import tippy, { Props } from "tippy.js";
import 'tippy.js/dist/tippy.css';

export function tooltip(node: HTMLElement, props: string | Partial<Props>) {
  if (typeof props === "string") props = { content: props };
  tippy(node, props);
}
