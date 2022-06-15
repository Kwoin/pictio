import { getGameById } from "../db/game.js";
import { getUsersByGameId } from "../db/user.js";
import { MSG_TYPE_TO_FRONT } from "./constants.js";

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
 * @param error type de l'erreur
 * @param errorArgs
 * @returns {Promise<Awaited<*>[]>}
 */
export function sendError(dest, error, ...errorArgs) {
  const payload = { code: error.code, message: error.message(...errorArgs) };
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
 * Récupérer les données d'une partie
 * @param id
 * @returns {Promise<{[p: string]: *}>}
 */
export async function buildGame(id) {
  const game = await getGameById(id);
  const users = await getUsersByGameId(id);
  return { ...game, users };
}
