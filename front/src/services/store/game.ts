import { derived, writable } from "svelte/store";
import type { Game, Picture, Score } from "../../model/game";
import { MSG_TYPE_TO_FRONT } from "../../../../server/shared/constants.js";
import type { WsResponse } from "../../model/ws";

export const wsMessages = writable<WsResponse>(null);
export const myUserId = writable<number>(null);
export const game = writable<Game>(null);
export const users = derived(game, $game => $game?.users ?? [])
export const me = derived([myUserId, users], ([$myUserId, $users]) => $users?.find(user => user.id === $myUserId) ?? null)
export const messages = derived(game, $game => $game?.messages ?? []);
export const pictures = derived(game, $game => $game?.pictures ?? []);
export const round = derived(game, $game => $game?.round);
export const randomPictures = writable<Picture[]>([]);
export const word = writable<string>(null);
export const scores = writable<Score[]>([]);
export const startRound = derived(wsMessages, ($wsMessages, set) => {
  if ($wsMessages?.type === MSG_TYPE_TO_FRONT.ROUND_START) {
    set(new Date());
    set(null)
  }
});
export const endRound = derived(wsMessages, ($wsMessages, set) => {
  if ($wsMessages?.type === MSG_TYPE_TO_FRONT.ROUND_END) {
    set(new Date());
    set(null);
  }
});
export const highlight = derived(wsMessages, ($wsMessages, set) => {
  if ($wsMessages?.type === MSG_TYPE_TO_FRONT.PLAY_HIGHLIGHT_PICTURE) {
    set($wsMessages.payload);
    set(null);
  }
})

export function resetStores() {
  myUserId.set(null);
  game.set(null);
  randomPictures.set([]);
  scores.set([]);
}
