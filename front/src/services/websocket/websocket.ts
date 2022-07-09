import type { WsRequestType, WsRequest } from "../../model/ws";
import { websocket } from "../store/web-socket";
import { isDevMode } from "../../common/utils";

async function getWs(): Promise<WebSocket> {
  return new Promise<WebSocket>(resolve => {
    const unsubscriber = websocket.subscribe($websocket => {
      if ($websocket != null) {
        resolve($websocket);
        setTimeout(() => unsubscriber());
      }
    })
  })
}

export function sendWsRequest<T = any>(type: WsRequestType, payload: T = null): void {
  const wsMessage: WsRequest = { type, payload };
  const content = JSON.stringify(wsMessage);
  getWs().then($websocket => {
    $websocket.send(content);
    if (isDevMode()) {
      console.log("Websocket Message Sent", wsMessage);
    }
  })
}

export function wsClose() {
  getWs().then($websocket => $websocket.close());
}
