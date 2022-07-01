import { getRandomColor } from "../shared/x11.js";

/**
 * Créer un utilisateur
 * @param game_id la partie de l'utilisateur
 * @param game_owner true si l'utilisateur a créer la partie game_id
 * @param username le nom de l'utilisateur
 * @returns {{connected: boolean, color: string, game_owner: boolean, ready: boolean, game_score: number, game_id, username}}
 */
export function newUser(game_id, game_owner, username) {
  return {
    game_id,
    game_owner,
    ready: true,
    game_score: 0,
    username: username,
    connected: true,
    color: getRandomColor()
  }
}
