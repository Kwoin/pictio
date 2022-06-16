import { readable } from "svelte/store";
import { MSG_TYPE_TO_FRONT } from "../../../server/ws/constants.js"
import { navigate } from "svelte-routing";
import type { Game, GameCreated, GameJoined } from "../model/game";
import { game, myUserId } from "./game";
import type { ErrorMsg } from "../model/error";

function getWs(): WebSocket {
  const ws = new WebSocket("ws://localhost:5201");
  ws.onopen = () => console.log("connexion ouverte");
  ws.onerror = error => console.error(error);
  ws.onmessage = messageEvent => {
    const { type, payload } = JSON.parse(messageEvent.data);
    console.log(`WS message received (${type})`, payload);
    dispatch(type)(payload)
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

function dispatch(type: keyof MSG_TYPE_TO_FRONT) {
  if (type === MSG_TYPE_TO_FRONT.GAME_CREATED) return gameCreated;
  if (type === MSG_TYPE_TO_FRONT.GAME_JOINED) return gameJoined;
  if (type === MSG_TYPE_TO_FRONT.GAME_DATA) return gameUpdated;
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

function onError(payload: ErrorMsg) {
  console.error(`WS ERROR ${payload.code}: ${payload.message}`);
}
