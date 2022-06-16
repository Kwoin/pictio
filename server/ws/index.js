import { GAME_STATE, MESSAGE_TYPE, MSG_TYPE_TO_BACK, MSG_TYPE_TO_FRONT } from "./constants.js";
import * as db from "../db/index.js"
import { sendError, sendMsg } from "./util.js";
import { getClient, insert, transaction } from "../db/index.js";
import { getGameById } from "../db/game.js";
import { ERROR, PictioError } from "./error.js";
import { getUserById } from "../db/user.js";
import { buildGame, startRound, updateGameState } from "../services/game.service.js";
import { insertMessage } from "../db/message.js";
import { label } from "../i18n/index.js";

const gameRegistry = new Map();
const userRegistry = new Map();

export class PictioWs {

  constructor(ws) {
    ws.on("connection", ws => {
      ws.on("message", async message => {
        const {type, payload} = JSON.parse(message);
        try {
          await dispatch(type)(payload, ws);
        } catch (e) {
          console.error(e.message, e.stack.split("\n"));
          if (e.name === "PictioError") {
            await sendError(ws, e)
          }
        }
      });
    });
  }

}

function dispatch(type) {
  console.log(type);
  if (type === MSG_TYPE_TO_BACK.GAME_CREATE) return gameCreate;
  if (type === MSG_TYPE_TO_BACK.USER_JOIN) return userJoin;
  if (type === MSG_TYPE_TO_BACK.USER_READY) return userReady;
  if (type === MSG_TYPE_TO_BACK.USER_NOT_READY) return userNotReady;
  if (type === MSG_TYPE_TO_BACK.GAME_START) return gameStart;
}

/**
 * Création d'une nouvelle partie
 * @param payload
 * @param ws
 * @returns {Promise<void>}
 */
async function gameCreate({username}, ws) {

  const result = await db.transaction(
      // Insérer une nouvelle entrée en base pour la partie
      (client) => db.insert('pictio.game', {state: GAME_STATE.LOBBY}, client),
      // Insérer une nouvelle entrée en base pour le propriétaire de la partie
      (client, res) => db.insert("pictio.user", {
        game_id: res.rows[0].id,
        game_owner: true,
        ready: false,
        game_score: 0,
        username: username,
        connected: true
      }, client)
  )
  const user = result.rows[0];
  const game_id = result.rows[0].game_id;

  // Créer une nouvelle entrée dans les registres
  gameRegistry.set(game_id, {users: [ws], owner: ws});
  userRegistry.set(ws, user);

  // Répondre au propriétaire avec les informations de création de la nouvelle partie
  const user_id = user.id;
  const gameCreated = {user_id, game_id}
  await sendMsg(ws, MSG_TYPE_TO_FRONT.GAME_CREATED, gameCreated)

  // Émettre les informations de la partie
  await sendGameData(game_id);

}

async function userJoin({game_id, username}, ws) {
  // Vérifier que la partie demandée existe bien
  const game = await getGameById(game_id);
  if (game == null) sendError(ws, ERROR.NOT_FOUND);

  // Créer l'utilisateur dans la base
  const client = await getClient();
  const result = await insert("pictio.user",
      {
        game_id,
        game_owner: false,
        ready: false,
        game_score: 0,
        username: username,
        connected: true,
      }, client);
  client.release();
  const user = result.rows[0];

  // Ajouter la socket de l'utilisateur dans les registres
  const gameRegistryData = gameRegistry.get(game_id);
  gameRegistryData.users = [...gameRegistryData.users, ws];
  userRegistry.set(ws, user);

  // Envoyer l'id de l'utilisateur
  const user_id = user.id;
  const msg = sendMsg(ws, MSG_TYPE_TO_FRONT.GAME_JOINED, {user_id})

  // Envoyer les informations de la partie à tous les participants
  await sendGameData(game_id);

}

async function userReady({user_id}, ws) {
  // Vérifier que l'utilisateur demandé existe bien
  const user = await getUserById(user_id);
  if (user == null) throw new PictioError(ERROR.NOT_FOUND);

  if (!user.ready) {
    // Mettre à jour l'utilisateur en base
    const client = await getClient();
    client.query('update pictio.user set "ready" = true where id = $1', [user_id]);
    client.release();

    // Envoyer les informations de la partie à tous les participants
    await sendGameData(user.game_id);
  }
}

async function userNotReady({user_id}, ws) {
  // Vérifier que l'utilisateur demandé existe bien
  const user = await getUserById(user_id);
  if (user == null) throw new PictioError(ERROR.NOT_FOUND);

  if (user.ready) {
    // Mettre à jour l'utilisateur en base
    const client = await getClient();
    client.query('update pictio.user set "ready" = false where id = $1', [user_id]);
    client.release();

    // Envoyer les informations de la partie à tous les participants
    await sendGameData(user.game_id);
  }
}

async function gameStart({game_id}, ws) {
  console.log(game_id);
  // Vérifier que la partie demandée existe bien
  const game = await getGameById(game_id);
  if (game == null) throw new PictioError(ERROR.NOT_FOUND);
  // Vérifier que c'est le propriétaire de la partie qui demande le lancement
  const user = userRegistry.get(ws);
  if (!(game.id === user.game_id && user.game_owner)) throw new PictioError(ERROR.UNAUTHORIZED);

  const result = await transaction(
      // 1. Mettre à jour le statut de la game
      (client) => updateGameState(game_id, GAME_STATE.PROGRESS, client),
      // 2. Créer le round
      (client) => startRound(game_id, client),
      // 3. Ajouter un message de bienvenue
      (client, res) => insertMessage(
          client,
          res.rows[0].round_id,
          MESSAGE_TYPE.INFO,
          label("message_new_game")
      )
  )

  // Envoyer les informations de la partie à tous les participants
  await sendGameData(user.game_id);

}

/**
 * Envoyer les informations d'une partie à tous ses participants
 * @param gameId
 */
async function sendGameData(gameId) {
  const dest = gameRegistry.get(gameId).users;
  const gameData = await buildGame(gameId);
  return sendMsg(dest, MSG_TYPE_TO_FRONT.GAME_DATA, gameData);
}


