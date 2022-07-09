import { clearStorageGame, getStorageGame, saveStorageGame } from "../storage/game";
import type { Game } from "../../model/game";
import { GAME_STATE, MSG_TYPE_TO_BACK } from "../../../../server/shared/constants.js";
import { game, me, myUserId } from "../store/game";
import { websocket } from "../store/web-socket";
import { derived, get } from "svelte/store";
import { sendWsRequest } from "../websocket/websocket";

/**
 * Enregistrement automatique des nouvelles games dans le storage
 */
derived([game, me], ( [$game, $me], set ) => {
  if ($me != null && getStorageGame()?.game.id !== $game.id) {
    set({game: $game, user: $me});
  }
}).subscribe(
    gameData => {
      if (gameData != null) saveStorageGame();
    }
)

/**
 * Recovery automatique depuis le store
 * lorsque la connexion de la websocket a été interrompue
 */
websocket.subscribe($websocket => {
  if ($websocket == null) return;
  const gameData = get(game);
  const userId = get(myUserId);
  if (gameData != null && userId != null) {
    sendWsRequest(MSG_TYPE_TO_BACK.USER_REJOIN, {game_id: gameData.id, user_id: userId})
  }
})

export async function canRecover(gameId?: number): Promise<number> {
  gameId ??= getStorageGame()?.game.id;
  if (gameId == null) return null;
  const response = await fetch(`/api/game/${gameId}`);
  if (!response.ok) return;
  const game = await response.json() as Game;
  if (game == null) return null;
  if (game?.state === GAME_STATE.DONE || game?.state === GAME_STATE.ABORTED) {
    clearStorageGame();
    return null;
  }
  return game.id;
}

export async function doRecover(): Promise<void> {
  const gameData = getStorageGame();
  if (gameData == null) return;
  myUserId.set(gameData.user.id);
  sendWsRequest(MSG_TYPE_TO_BACK.USER_REJOIN, { game_id: gameData.game.id, user_id: gameData.user.id });
}
