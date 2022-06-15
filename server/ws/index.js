import { GAME_STATE, MSG_TYPE_TO_BACK, MSG_TYPE_TO_FRONT } from "./constants.js";
import * as db from "../db/index.js"
import { buildGame, sendError, sendMsg } from "./util.js";
import { getClient, insert } from "../db/index.js";
import { getGameById } from "../db/game.js";
import { ERROR } from "./error.js";
import { getUserById } from "../db/user.js";

const gameRegistry = new Map();
const userRegistry = new Map();

export class PictioWs {

  constructor(ws) {
    ws.on("connection", ws => {
      ws.on("message", message => {
        const {type, payload} = JSON.parse(message);
        dispatch(type)(payload, ws);
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
}

/**
 * Création d'une nouvelle partie
 * @param payload
 * @param ws
 * @returns {Promise<void>}
 */
async function gameCreate({ username }, ws) {

  try {
    const result = await db.transaction(
        // Insérer une nouvelle entrée en base pour la partie
        (client) => db.insert('pictio.game', {state: GAME_STATE.LOBBY})(client),
        // Insérer une nouvelle entrée en base pour le propriétaire de la partie
        (client, res) => {
          return db.insert("pictio.user", {
            game_id: res.rows[0].id,
            game_owner: true,
            lobby_ready: false,
            game_score: 0,
            username: username
          })(client)
        }
    )
    const user_id = result.rows[0].id;
    const game_id = result.rows[0].game_id;

    // Créer une nouvelle entrée dans les registres
    gameRegistry.set(game_id, {users: [ws], owner: ws});
    userRegistry.set(ws, user_id);

    // Répondre au propriétaire avec les informations de création de la nouvelle partie
    const gameCreated = {user_id, game_id}
    await sendMsg(ws, MSG_TYPE_TO_FRONT.GAME_CREATED, gameCreated)

    // Émettre les informations de la partie
    await sendGameData(game_id);

  } catch (e) {
    console.error(e);
  }

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
            lobby_ready: false,
            game_score: 0,
            username: username
          })(client);
  client.release();
  const user_id = result.rows[0].id;

  // Ajouter la socket de l'utilisateur dans les registres
  const gameRegistryData = gameRegistry.get(game_id);
  gameRegistryData.users = [...gameRegistryData.users, ws];
  userRegistry.set(ws, user_id);

  // Envoyer l'id de l'utilisateur
  const msg = sendMsg(ws, MSG_TYPE_TO_FRONT.GAME_JOINED, { user_id })

  // Envoyer les informations de la partie à tous les participants
  await sendGameData(game_id);

}

async function userReady({user_id}, ws) {

  console.log(user_id);

  // Vérifier que l'utilisateur demandé existe bien
  const user = await getUserById(user_id);
  if (user == null) sendError(ws, ERROR.NOT_FOUND);

  if (!user.lobby_ready) {
    // Mettre à jour l'utilisateur en base
    const client = await getClient();
    client.query('update pictio.user set "lobby_ready" = true where id = $1', [user_id]);
    client.release();

    // Envoyer les informations de la partie à tous les participants
    await sendGameData(user.game_id);
  }
}

async function userNotReady({user_id}, ws) {
  // Vérifier que l'utilisateur demandé existe bien
  const user = await getUserById(user_id);
  if (user == null) sendError(ws, ERROR.NOT_FOUND);

  if (user.lobby_ready) {
    // Mettre à jour l'utilisateur en base
    const client = await getClient();
    client.query('update pictio.user set "lobby_ready" = false where id = $1', [user_id]);
    client.release();

    // Envoyer les informations de la partie à tous les participants
    await sendGameData(user.game_id);
  }
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


