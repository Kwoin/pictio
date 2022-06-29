import { MSG_TYPE_TO_FRONT } from "./constants.js";
import { buildGame, getCurrentRound } from "../services/game.service.js";
import { ERROR, PictioError } from "./error.js";
import { getRandomImages } from "../client/unsplash.js";
import { gameRegistry, userRegistry } from "../services/registry.service.js";

/**
 * Envoyer un message par WebSocket à un ou plusieurs destinataires
 * @param dest destinataires: WebSocket | WebSocket[]
 * @param type type du message
 * @param payload contenu du message
 * @returns {Promise<Awaited<*>[]>}
 */
export function sendMsg(dest, type, payload) {
  if (dest == null) throw new Error("dest cannot be null");
  const msg = wsMsg(type, payload);
  if (!Array.isArray(dest)) dest = [dest];
  const promises = dest.map(ws => ws.send(msg));
  return Promise.all(promises);
}

/**
 * Envoyer une erreur par WebSocket à un ou plusieurs destinataires
 * @param dest destinataires: WebSocket | WebSocket[]
 * @param error
 * @returns {Promise<Awaited<*>[]>}
 */
export function sendError(dest, error) {
  const payload = {code: error.code, message: error.message};
  return sendMsg(dest, MSG_TYPE_TO_FRONT.ERROR, payload);
}

/**
 * Construire un message à envoyer par WebSocket
 * @param type type du message
 * @param payload contenu du message
 * @returns {string}
 */
export function wsMsg(type, payload) {
  return JSON.stringify({type, payload});
}

/**
 * Envoyer les informations d'une partie à tous ses participants
 * @param gameId
 */
export async function sendGameData(gameId, messageType = MSG_TYPE_TO_FRONT.GAME_DATA) {
  const game = gameRegistry.get(gameId)
  if (game == null) return;
  const dest = game.users;
  const gameData = await buildGame(gameId);
  return sendMsg(dest, messageType, gameData);
}

/**
 * Envoyer des images aléatoires au joueur solo
 * @param game_id
 * @returns {Promise<void>}
 */
export async function sendRandomImages(game_id) {
  // On récupère le joueur solo
  const round = await getCurrentRound(game_id);
  if (round == null) throw new PictioError(ERROR.ILLEGAL_STATE);
  const solo_user_id = round.solo_user_id;

  // On récupère la ws du joueur solo
  const wsSolo = [...userRegistry.entries()].find(([key, value]) => value.id === solo_user_id)?.[0];

  // On récupère et on envoie des images aléatoires
  const images = await getRandomImages(game_id, 10);
  await sendMsg(wsSolo, MSG_TYPE_TO_FRONT.PLAY_PICTURES, images);
}

/**
 * Envoyer le mot secret au joueur solo
 * @param game_id
 * @returns {Promise<void>}
 */
export async function sendWord(game_id) {
  // On vérifie que la game a bien un round en cours
  const round = await getCurrentRound(game_id);
  if (round == null) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On récupère la ws du joueur solo
  const solo_user_id = round.solo_user_id;
  const dest = [...userRegistry.entries()].find(([key, value]) => value.id === solo_user_id)?.[0];

  // On lui envoie le mot
  await sendMsg(dest, MSG_TYPE_TO_FRONT.PLAY_WORD, round.word);
}

/**
 * Envoyer les scores aux participants d'une partie
 * @param game_id
 * @param scores
 * @returns {Promise<void>}
 */
export async function sendScores(game_id, scores) {
  const game = gameRegistry.get(game_id);
  if (game == null) return;
  const dest = game.users;
  await sendMsg(dest, MSG_TYPE_TO_FRONT.ROUND_END, scores);
}

/**
 * Envoyer l'id d'une image à mettre en valeur à tous les pariticipants d'une partie
 * @param game_id
 * @param picture_id
 * @returns {Promise<void>}
 */
export async function sendPictureHighlight(game_id, picture_id) {
  const game = gameRegistry.get(game_id);
  if (game == null) return;
  const dest = game.users;
  await sendMsg(dest, MSG_TYPE_TO_FRONT.PLAY_HIGHLIGHT_PICTURE, picture_id);
}
