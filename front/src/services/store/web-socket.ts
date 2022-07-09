import { derived, get, readable } from "svelte/store";
import { MSG_TYPE_TO_FRONT, MSG_TYPE_TO_BACK } from "../../../../server/shared/constants.js"
import { navigate } from "svelte-routing";
import type { Game, GameCreated, GameJoined, Picture, Score } from "../../model/game";
import { game, myUserId, randomPictures, scores, word, wsMessages } from "./game";
import type { ErrorMsg } from "../../model/error";
import type { WsResponse } from "../../model/ws";
import { isDevMode } from "../../common/utils";

function createWs(): Promise<WebSocket> {
  return new Promise<WebSocket>((resolve) => {
    const scheme = location.protocol === "http:" ? "ws" : "wss";
    const ws = new WebSocket(`${scheme}://${location.host}/ws`);
    ws.onopen = () => {
      console.log("connexion ouverte");
      resolve(ws);
    }
    ws.onerror = error => console.error(error);
    ws.onmessage = messageEvent => {
      const wsMessage: WsResponse = JSON.parse(messageEvent.data);
      if (isDevMode()) console.log(`Websocket Message Received`, wsMessage);
      wsMessages.set(wsMessage);
      dispatch(wsMessage.type)?.(wsMessage.payload);
    }
  })
}

let ws: WebSocket;
export const websocket = readable(null, (set) => {
  const interval = setInterval(() => {
    if (ws == null || ws.readyState === WebSocket.CLOSED) {
      console.log("Connexion WebSocket...");
      createWs().then(res => {
        ws = res;
        set(ws);
      })
    }
  }, 1000)
});

function dispatch(type: string) {
  if (type === MSG_TYPE_TO_FRONT.GAME_CREATED) return gameCreated;
  if (type === MSG_TYPE_TO_FRONT.GAME_JOINED) return gameJoined;
  if (type === MSG_TYPE_TO_FRONT.GAME_DATA) return gameUpdated;
  if (type === MSG_TYPE_TO_FRONT.PLAY_PICTURES) return playPictures;
  if (type === MSG_TYPE_TO_FRONT.PLAY_WORD) return playWord;
  if (type === MSG_TYPE_TO_FRONT.ROUND_START) return roundStart;
  if (type === MSG_TYPE_TO_FRONT.ROUND_END) return roundEnd;
  if (type === MSG_TYPE_TO_FRONT.ERROR) return onError;
}

function gameCreated(payload: GameCreated) {
  myUserId.set(payload.user_id);
  navigate(`/game/${payload.game_id.toString(36)}`);
}

function gameJoined(payload: GameJoined) {
  myUserId.set(payload.user_id);
}

function gameUpdated(payload: Game) {
  game.set(payload);
}

function playPictures(payload: Picture[]) {
  randomPictures.set(payload);
}

function playWord(payload: string) {
  word.set(payload);
}

function roundStart(payload: Game) {
  game.set(payload);
}

function roundEnd(payload: Score[]) {
  scores.set(payload);
}

function onError(payload: ErrorMsg) {
  console.error(`WS ERROR ${payload.code}: ${payload.message}`);
}


