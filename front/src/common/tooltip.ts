import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';

export function tooltip(node: HTMLElement, props: string | any) {
  if (typeof props === "string") props = { content: props };
  console.log(node);
  console.log(props)
  tippy(node, props);
}
