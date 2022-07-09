import type { MSG_TYPE_TO_BACK, MSG_TYPE_TO_FRONT } from "../../../server/shared/constants.js";

export type WsRequestType = typeof MSG_TYPE_TO_BACK[keyof typeof MSG_TYPE_TO_BACK];
export interface WsRequest<T = any> {
  type: WsRequestType;
  payload: T;
}

export type WsResponseType = typeof MSG_TYPE_TO_FRONT[keyof typeof MSG_TYPE_TO_FRONT];
export interface WsResponse<T = any> {
  type: WsResponseType;
  payload: T;
}
