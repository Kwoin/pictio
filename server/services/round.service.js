import { getWords } from "../i18n/index.js";
import { getActiveUsersByGameId } from "../db/user.js";
import { getRoundById } from "../db/round.js";

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
 * - le flag end n'est pas null
 * - OU tous les participants ont trouvé le mot
 * @param round_id
 * @returns {Promise<boolean>}
 */
export async function isRoundEnd(round_id) {
  const round = await getRoundById(round_id);
  if (round == null) return false;
  if (round.end != null) return true;
  const users = await getActiveUsersByGameId(round.game_id);
  return users.every(user => user.success != null || user.id === round.solo_user_id);
}
