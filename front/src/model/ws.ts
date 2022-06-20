export interface WsMessage<T = any> {
  type: string;
  payload: T;
}
