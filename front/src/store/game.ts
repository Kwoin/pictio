import { derived, writable } from "svelte/store";
import type { Game, Picture, RandomPicture } from "../model/game";
import { MSG_TYPE_TO_FRONT, ROUND_DURATION } from "../../../server/ws/constants.js";
import type { WsMessage } from "../model/ws";

export const wsMessages = writable<WsMessage>(null);
export const myUserId = writable<number>(null);
export const game = writable<Game>(null);
export const users = derived(game, $game => $game?.users ?? [])
export const me = derived([myUserId, users], ([$myUserId, $user]) => $user?.find(user => user.id === $myUserId) ?? null)
export const messages = derived(game, $game => $game?.messages ?? []);
export const pictures = derived(game, $game => $game?.pictures ?? []);
export const round = derived(game, $game => $game?.round);
export const randomPictures = writable<Picture[]>([]);
export const word = writable<string>(null);

const timer = (messageType: string, duration: number) => derived(wsMessages, ($wsMessages, set) => {
  if ($wsMessages?.type === messageType) {
    set(new Date(duration));
    const start = new Date();
    const interval = setInterval(() => {
      const now = new Date();
      const timeLeft = duration - (now.getTime() - start.getTime());
      set(new Date(timeLeft));
      if (timeLeft < 1000) {
        clearInterval(interval);
      }
    }, 500);
  }
})
export const roundTimer = timer(MSG_TYPE_TO_FRONT.ROUND_START, ROUND_DURATION);
