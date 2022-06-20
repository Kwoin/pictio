import { getWords } from "../i18n/index.js";
import { getActiveUsersByGameId, setUserScore } from "../db/user.js";
import { getRoundById } from "../db/round.js";
import { getUserScore } from "./game.service.js";
import { transaction } from "../db/index.js";

export function getRandomWord() {
  const words = getWords();
  const r = Math.floor(Math.random() * words.length);
  return words[r];
}

export async function checkWord(text, round_id) {
  const round = await getRoundById(round_id);
  return round?.word === text;
}

/**
 * Un round est terminé si
 * - tous les participants ont trouvé le mot
 * - le temps est écoulé (todo)
 * @param round_id
 * @returns {Promise<boolean>}
 */
export async function isRoundEnd(round_id) {
  const round = await getRoundById(round_id);
  if (round == null) return false;
  const users = await getActiveUsersByGameId(round.game_id);
  return users.every(user => user.success != null || user.id === round.solo_user_id);
}
