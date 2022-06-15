export interface WsMessage {
  type: string;
  payload: any;
}

export function createWsMsg(type: string, payload: any): string {
  const wsMessage: WsMessage = { type, payload };
  return JSON.stringify(wsMessage);
}
