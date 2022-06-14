import { readable } from "svelte/store";
import { MSG_TYPE_TO_FRONT } from "../../../server/ws/constants.js"
import { navigate } from "svelte-routing";

const ws = new WebSocket("ws://localhost:5201");
ws.onopen = () => console.log("connexion ouverte");
ws.onerror = error => console.error(error);

export const websocket = readable(ws);

ws.onmessage = messageEvent => {
  const { type, payload } = JSON.parse(messageEvent.data);
  dispatch(type)(payload)
}

function dispatch(type: keyof MSG_TYPE_TO_FRONT) {
  if (type === MSG_TYPE_TO_FRONT.GAME_CREATED) return gameCreated;
}

function gameCreated(payload: {id: number}) {
  navigate(`/game/${payload.id.toString(36)}`);
}
