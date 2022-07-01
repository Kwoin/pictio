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
  round: Round;
}

export interface User {
  id: number;
  game_id: number;
  game_role: string;
  ready: boolean;
  game_score: number;
  username: string;
  game_owner: boolean;
  success: boolean;
  color: string;
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
  id?: number;
  index?: number;
  url_small: string;
  url_medium: string;
  url_big: string;
  url_origin: string;
  author: string;
  description: string;
}

export interface Round {
  id: number;
  game_id: number;
  solo_user_id: number;
  creation: string;
  end: string;
  word?: string;
}

export interface Score {
  user: User;
  score: number;
}
