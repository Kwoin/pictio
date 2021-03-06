export const MSG_TYPE_TO_BACK = {
  GAME_CREATE: "game-create",
  USER_JOIN: "user-join",
  USER_REJOIN: "user-rejoin",
  USER_LEAVE: "user-leave",
  USER_READY: "user-ready",
  USER_NOT_READY: "user-not-ready",
  USER_READY_NEXT_ROUND: "user-ready-next-round",
  GAME_START: "user-start",
  PLAY_SEND_CARD: "play-send-card",
  PLAY_SEND_MESSAGE: "play-send-message",
  PLAY_FETCH_PICTURES: "play-fetch-pictures",
  PLAY_HIGHLIGHT_PICTURE: "play-highlight-picture"
}

export const MSG_TYPE_TO_FRONT = {
  GAME_CREATED: "game-created",
  GAME_JOINED: "game-joined",
  GAME_DATA: "game-data",
  ROUND_START: "round-start",
  ROUND_END: "round-end",
  PLAY_WORD: "play-word",
  PLAY_PICTURES: "play-pictures",
  PLAY_HIGHLIGHT_PICTURE: "play-highlight-picture",
  ERROR: "error"
}

export const GAME_STATE = {
  LOBBY: "LOBBY",
  PROGRESS: "PROGRESS",
  ABORTED: "ABORTED",
  DONE: "DONE"
}

export const MESSAGE_TYPE = {
  USER: "USER",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
  INFO: "INFO",
}

export const MAX_SOLO_USER_COUNT = 3;
export const ROUND_DURATION = 3 * 60 * 1000;
export const SOLO_SCORE = 200;
export const SCORE_ALG = x => SOLO_SCORE + ((ROUND_DURATION - x) / ROUND_DURATION) * 800;
export const CONFIRM_DURATION = 20 * 1000;
export const MAX_HIGHLIGHTED_PICTURES = 3;
