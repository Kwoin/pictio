import { readable } from "svelte/store";

const ws = new WebSocket("ws://localhost:5201");
ws.onopen = () => console.log("connexion ouverte");
ws.onerror = error => console.error(error);

export const websocket = readable(ws);
