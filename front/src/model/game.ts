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
  messages: Message[];
  pictures: Picture[];
}

export interface User {
  id: number;
  game_id: number;
  game_role: string;
  ready: boolean;
  game_score: number;
  username: string;
  game_owner: boolean;
}

export interface Message {
  id: number;
  round_id: number;
  game_id: number;
  user_id: number;
  type: string;
  text: string;
}

export interface Picture {
  id: number;
  url: string;
}
