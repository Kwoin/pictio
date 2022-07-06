import { writable } from "svelte/store";

export const pathname = writable<string>(null);

export function updatePathname() {
  pathname.set(location.pathname);
}
