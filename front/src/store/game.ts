import { derived, writable } from "svelte/store";
import type { Game } from "../model/game";

export const myUserId = writable<number>(null);
export const game = writable<Game>(null);
export const users = derived(game, $game => $game?.users ?? [])
export const me = derived([myUserId, users], ([$myUserId, $user]) => $user?.find(user => user.id === $myUserId) ?? null)
