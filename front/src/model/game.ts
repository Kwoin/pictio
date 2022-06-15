import type { GAME_STATE } from "../../../server/ws/constants.js"

export interface GameCreated {
  user_id: number;
  game_id: number;
}

export interface GameJoined {
  user_id: number;
}

export interface Game {
  id: number;
  state: keyof GAME_STATE;
  users: User[]
}

export interface User {
  id: number;
  game_id: number;
  game_role: string;
  lobby_ready: boolean;
  game_score: number;
  username: string;
  game_owner: boolean;
}
