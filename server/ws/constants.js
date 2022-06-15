export const MSG_TYPE_TO_BACK = {
  GAME_CREATE: "game-create",
  USER_JOIN: "user-join",
  USER_READY: "user-ready",
  USER_NOT_READY: "user-not-ready",
  USER_START: "user-start",
  PLAY_SEND_CARD: "play-send-card",
  PLAY_SEND_WORD: "play-send-word",
}

export const MSG_TYPE_TO_FRONT = {
  GAME_CREATED: "game-created",
  GAME_JOINED: "game-joined",
  GAME_DATA: "game-data",
  GAME_STARTED: "user-started",
  GAME_END: "game-end",
  ERROR: "error"
}

export const GAME_STATE = {
  LOBBY: "LOBBY",
  PROGRESS: "PROGRESS",
  ABORTED: "ABORTED",
  DONE: "DONE"
}
