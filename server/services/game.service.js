import { getGameById, resetGameUsers } from "../db/game.js";
import { getActiveUsersByGameId, getUserById, getUsersByGameId, setUserScore } from "../db/user.js";
import { getRoundById, getRoundsByGameId, getRoundsCountGroupedBySoloUserId, setRoundEnd } from "../db/round.js";
import { insert, transaction } from "../db/index.js";
import { getMessagesByGameId } from "../db/message.js";
import { getPicturesOfLastRoundByGameId } from "../db/picture.js";
import { GAME_STATE } from "../ws/constants.js";
import { getRandomWord } from "./round.service.js";
import { MAX_SOLO_USER_COUNT, ROUND_DURATION, SOLO_SCORE } from "../ws/constants.js"

/**
 * Récupérer les données d'une partie
 * @param id
 * @returns {Promise<{[p: string]: *}>}
 */
export async function buildGame(id) {
  const game = await getGameById(id);
  const users = await getActiveUsersByGameId(id);
  const messages = await getMessagesByGameId(id);
  const pictures = await getPicturesOfLastRoundByGameId(id);
  const round = await getCurrentRound(id);
  if (round != null && round.end == null) delete round.word;
  return {...game, round, users, messages, pictures};
}

/**
 * Commencer un nouveau round dans une game
 * @param game_id
 * @param client
 * @returns {Promise<*>}
 */
export async function startRound(game_id, client, onRoundEnd) {
  // On s'assure que les données des participants sont bien remises à zéro
  await resetGameUsers(game_id, client);

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

  // On prend un mot au hasard à deviner
  const word = await getRandomWord();
  console.log("Mot à trouver", word);

  // On crée un nouveau round
  const result = await insert("pictio.round", {game_id, solo_user_id, word}, client);
  const newRound = result.rows[0];

  // On créé un timer pour achever le round au bout d'un temps donné
  new Promise(resolve => setTimeout(() => resolve(), ROUND_DURATION))
      .then(_ => endRound(game_id, newRound.id))
      .then(scores => {
        if (scores != null) onRoundEnd?.(scores)
      });

  return newRound;

}

/**
 * Terminer un round et mettre à jour les scores des participants
 * @param game_id
 * @param round_id
 * @returns {Promise<null|Awaited<unknown>[]>}
 */
export async function endRound(game_id, round_id) {

  // Si le round est déjà terminé, on ne fait rien
  const round = await getRoundById(round_id)
  if (round.end != null) return null;

  // On calcule les scores des participants
  const users = await getActiveUsersByGameId(game_id);
  const usersWithScore = await Promise.all(
      users
          .map(async user => ({
            user,
            score: await getUserScore(user.id)
          }))
  )
  // On créé des requêtes de mise à jour pour tous les utilisateurs qui ont un score > 0
  const queries = usersWithScore
      .filter(userWithScore => userWithScore.score > 0)
      .map(userWithScore => client => setUserScore(client, userWithScore.user.id, userWithScore.user.game_score + userWithScore.score));
  // On exécute ces requêtes dans une transaction + la requête de mise à jour de la date de fin du round
  await transaction(
      ...queries,
      client => setRoundEnd(client, round.id)
  );

  return usersWithScore;
}

/**
 * Récupéré le round en cours d'une game
 * @param game_id
 * @returns {Promise<*>}
 */
export async function getCurrentRound(game_id) {
  // La game doit être à l'état "PROGRESS"
  const game = await getGameById(game_id);
  if (game.state !== GAME_STATE.PROGRESS) return null;

  // On récupère ses rounds et on renvoie le premier de la liste
  const rounds = await getRoundsByGameId(game_id);
  return rounds[0];
}

/**
 * Une game est terminée lorsque tous les joueurs encore actifs ont été solo 3x
 * @param game_id
 * @returns {Promise<boolean>}
 */
export async function isGameEnd(game_id) {
  const users = await getActiveUsersByGameId(game_id);
  const usersIds = users.map(user => user.id);
  const roundsCountGroupedBySoloUserId = await getRoundsCountGroupedBySoloUserId(usersIds);
  return roundsCountGroupedBySoloUserId.every(entry => +entry.count === MAX_SOLO_USER_COUNT);
}

export async function getUserScore(user_id) {
  // On récupère les informations de l'utilisateur
  const user = await getUserById(user_id);
  if (user == null) return null;

  // On récupère les informations du round en court
  const round = await getCurrentRound(user.game_id);
  if (round == null) return null;

  if (user_id === round.solo_user_id) {
    // S'il s'agit du joueur solo, il gagne un forfait pour chaque participant qui a trouvé le mot
    const users = await getActiveUsersByGameId(user.game_id);
    return users
        .filter(user => user.success != null)
        .length * SOLO_SCORE;
  } else {
    // Sinon, on calcule le score en fonction du temps mis pour trouver le mot
    const roundStart = new Date(round.creation);

    if (user.success == null) return 0;
    const success = new Date(user.success);

    const f = x => ((ROUND_DURATION - x) / ROUND_DURATION) * 1000
    const time = success - roundStart;

    return Math.floor(f(time));
  }

}
