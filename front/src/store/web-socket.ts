import { readable } from "svelte/store";
import { MSG_TYPE_TO_FRONT } from "../../../server/ws/constants.js"
import { navigate } from "svelte-routing";
import type { Game, GameCreated, GameJoined, Picture, Score } from "../model/game";
import { game, myUserId, randomPictures, scores, word, wsMessages } from "./game";
import type { ErrorMsg } from "../model/error";
import type { WsMessage } from "../model/ws";

function getWs(): WebSocket {
  console.log(location.host)
  const ws = new WebSocket(`ws://${location.host}/ws`);
  ws.onopen = () => console.log("connexion ouverte");
  ws.onerror = error => console.error(error);
  ws.onmessage = messageEvent => {
    const wsMessage: WsMessage = JSON.parse(messageEvent.data);
    console.log(`WS message received (${wsMessage.type})`, wsMessage.payload);
    wsMessages.set(wsMessage);
    dispatch(wsMessage.type)?.(wsMessage.payload);
  }
  return ws;
}

let ws = getWs();

export const websocket = readable(ws, (set) => {
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.CLOSED) {
      console.log("reconnexion");
      ws = getWs();
      set(ws);
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


