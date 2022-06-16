import { getGameById } from "../db/game.js";
import { getActiveUsersByGameId, getUsersByGameId } from "../db/user.js";
import { getRoundsByGameId } from "../db/round.js";
import { insert } from "../db/index.js";
import { getMessagesByGameId } from "../db/message.js";
import { getPicturesOfLastRoundByGameId } from "../db/picture.js";

/**
 * Récupérer les données d'une partie
 * @param id
 * @returns {Promise<{[p: string]: *}>}
 */
export async function buildGame(id) {
  const game = await getGameById(id);
  const users = await getUsersByGameId(id);
  const messages = await getMessagesByGameId(id);
  const pictures = await getPicturesOfLastRoundByGameId(id);
  return { ...game, users, messages, pictures };
}

export async function updateGameState(game_id, state, client) {
  return client.query("update pictio.game set state = $1 where game_id = $2", [state, game_id]);
}

export async function startRound(game_id, client) {
  // Définition du nouveau joueur solo
  // On récupère les joueurs actifs et on va déterminer ceux qui ont été le moins souvent solo
  const rounds = await getRoundsByGameId(game_id);
  const users = await getActiveUsersByGameId(game_id);
  const usersWithSoloCount = users.map(user => (
      {
        user,
        count: rounds.filter(round => round.solo_user_id === user.id).length,
      }
    )
  )
  const soloCounts = usersWithSoloCount.map(userWithSoloCount => userWithSoloCount.count);
  const minSolo = Math.min(...soloCounts);
  const possibleSoloUsers = usersWithSoloCount
      .filter(userWithSoloCount => userWithSoloCount.count === minSolo)
      .map(userWithSoloCount => userWithSoloCount.user);
  // On en prend un au hasard parmi ceux qui ont été le moins souvent solo
  const r = Math.floor(Math.random() * possibleSoloUsers.length);
  const solo_user_id = possibleSoloUsers[r].id;

  // On crée un nouveau round
  console.log(game_id)
  console.log(solo_user_id)
  return insert("pictio.round", { game_id, solo_user_id }, client)

}
