import { GAME_STATE, MESSAGE_TYPE, MSG_TYPE_TO_BACK, MSG_TYPE_TO_FRONT } from "./constants.js";
import { getClient, insert, transaction } from "../db/index.js";
import { getGameById, updateGameState } from "../db/game.js";
import { ERROR, PictioError } from "./error.js";
import { getActiveUsersByGameId, getUserById, setUserInactive, setUserReady, setUserSuccess } from "../db/user.js";
import { getCurrentRound, isGameEnd, startRound, endRound } from "../services/game.service.js";
import { insertMessage } from "../db/message.js";
import { label } from "../i18n/index.js";
import { checkWord, isRoundEnd } from "../services/round.service.js";
import { sendError, sendMsg, sendGameData, sendWord, sendRandomImages, sendScores } from "./send.js";
import { gameRegistry, userRegistry } from "../services/registry.service.js";
import { WebSocketServer } from "ws";

export function pictioWebsocketServer(expressServer) {
  const webSocketServer = new WebSocketServer({ noServer: true, path: '/ws' });

  expressServer.on("upgrade", (request, socket, head) => {
    webSocketServer.handleUpgrade(request, socket, head, (websocket) => {
      webSocketServer.emit("connection", websocket, request);
    })
  })

  webSocketServer.on("connection", ws => {
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
    ws.on("close", message => {
      handleWsClose(ws);
    })
  });

  return webSocketServer;
}

function dispatch(type) {
  console.log(type);
  if (type === MSG_TYPE_TO_BACK.GAME_CREATE) return gameCreate;
  if (type === MSG_TYPE_TO_BACK.USER_JOIN) return userJoin;
  if (type === MSG_TYPE_TO_BACK.USER_READY) return userReady;
  if (type === MSG_TYPE_TO_BACK.USER_NOT_READY) return userNotReady;
  if (type === MSG_TYPE_TO_BACK.GAME_START) return gameStart;
  if (type === MSG_TYPE_TO_BACK.PLAY_SEND_CARD) return playSendCard;
  if (type === MSG_TYPE_TO_BACK.PLAY_SEND_MESSAGE) return playSendMessage;
  if (type === MSG_TYPE_TO_BACK.USER_READY_NEXT_ROUND) return userReadyNextRound;
  if (type === MSG_TYPE_TO_BACK.PLAY_FETCH_PICTURES) return playFetchPictures;
}

/**
 * Création d'une nouvelle partie
 * @param payload
 * @param ws
 * @returns {Promise<void>}
 */
async function gameCreate({username}, ws) {

  const result = await transaction(
      // Insérer une nouvelle entrée en base pour la partie
      (client) => insert('pictio.game', {state: GAME_STATE.LOBBY}, client),
      // Insérer une nouvelle entrée en base pour le propriétaire de la partie
      (client, res) => insert("pictio.user", {
        game_id: res.rows[0].id,
        game_owner: true,
        ready: true,
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
  // Vérifier que la partie demandée existe bien dans le registry et en base
  const gameRegistryData = gameRegistry.get(game_id);
  if (gameRegistryData == null) throw new PictioError(ws, ERROR.NOT_FOUND);
  const game = await getGameById(game_id);
  if (game == null) throw new PictioError(ws, ERROR.NOT_FOUND);

  // Créer l'utilisateur dans la base
  const client = await getClient();
  const result = await insert("pictio.user",
      {
        game_id,
        game_owner: false,
        ready: true,
        game_score: 0,
        username: username,
        connected: true,
      }, client);
  client.release();
  const user = result.rows[0];

  // Ajouter la socket de l'utilisateur dans les registres
  gameRegistryData.users = [...gameRegistryData.users, ws];
  userRegistry.set(ws, user);

  // Envoyer l'id de l'utilisateur
  const user_id = user.id;
  const msg = sendMsg(ws, MSG_TYPE_TO_FRONT.GAME_JOINED, {user_id})

  // Envoyer les informations de la partie à tous les participants
  await sendGameData(game_id);

}

async function userReady(_, ws) {
  // On récupère les informations de l'utilisateur
  const user = userRegistry.get(ws);

  // On vérifie que la game de l'utilisateur est bien en lobby
  const game = await getGameById(user.game_id);
  if (game.state !== GAME_STATE.LOBBY) throw new PictioError(ERROR.ILLEGAL_STATE);

  if (!user.ready) {
    // Mettre à jour l'utilisateur en base
    const client = await getClient();
    setUserReady(client, user.id)
    client.release();

    // Envoyer les informations de la partie à tous les participants
    await sendGameData(user.game_id);
  }
}

async function userNotReady(_, ws) {
  // On récupère les informations de l'utilisateur
  const user_id = userRegistry.get(ws).id;
  const user = await getUserById(user_id);

  // On vérifie que la game de l'utilisateur est bien en lobby
  const game = await getGameById(user.game_id);
  if (game.state !== GAME_STATE.LOBBY) throw new PictioError(ERROR.ILLEGAL_STATE);

  if (user.ready) {
    // Mettre à jour l'utilisateur en base
    const client = await getClient();
    setUserReady(client, user.id, false)
    client.release();

    // Envoyer les informations de la partie à tous les participants
    await sendGameData(user.game_id);
  }
}

async function gameStart({game_id}, ws) {
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
      (client) => startRound(game_id, client, (scores) => {
        return Promise.all([
            sendScores(game_id, scores),
            sendGameData(game_id)
        ])
      }),
      // 3. Ajouter un message de bienvenue
      (client, res) => insertMessage(
          client,
          res.id,
          MESSAGE_TYPE.INFO,
          label("message_new_game")
      )
  )

  // Envoyer les informations de la partie à tous les participants
  await sendGameData(game_id, MSG_TYPE_TO_FRONT.ROUND_START);

  // Envoyer des nouvelles images et le mot
  await sendRandomImages(game_id);
  await sendWord(game_id);

}

export async function playSendCard(picture, ws) {
  // Une carte a été selectionnée
  // On récupère les informations de l'émetteur
  const user = userRegistry.get(ws);

  // On récupère le round en cours de la game
  const currentRound = await getCurrentRound(user.game_id);
  if (currentRound == null || currentRound.end != null) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On vérifie que le joueur est bien le joueur solo
  if (currentRound.solo_user_id !== user.id) throw new PictioError(ERROR.UNAUTHORIZED)

  // On enregistre l'image sélectionnée en base
  const client = await getClient();
  await insert("pictio.picture", {...picture, round_id: currentRound.id}, client);
  client.release();

  // Envoyer les informations de la partie à tous les participants
  await sendGameData(user.game_id);

  // Envoyer des nouvelles images
  await sendRandomImages(user.game_id);
}

export async function playSendMessage({text}, ws) {
  // Un message a été envoyé
  // On récupère les informations de l'émetteur
  const user = userRegistry.get(ws);
  const game_id = user.game_id;

  // On récupère le round en cours de la game
  const currentRound = await getCurrentRound(game_id);
  if (currentRound == null) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On vérifie que le joueur n'est pas le joueur solo
  if (currentRound.solo_user_id === user.id) throw new PictioError(ERROR.UNAUTHORIZED)

  if (currentRound.end == null) {
    // Si le round n'est pas terminé, on vérifie si le message correspond au mot à trouver
    if (await checkWord(text, currentRound.id)) {
      // Si l'utilisateur a trouvé le mot
      const result = await transaction(
          // 1. On assigne success à l'utilisateur en base
          (client) => setUserSuccess(user.id, client),
          // 2. On en registre un message de succès en base
          (client) => insertMessage(client, currentRound.id, MESSAGE_TYPE.SUCCESS, label("message_success")(user.username))
      )
      if (await isRoundEnd(currentRound.id)) {
        // Si les conditions sont réunies, on termine le round en cours et on envoie les scores
        const scores = await endRound(game_id, currentRound.id);
        await sendScores(game_id, scores);
      }
    } else {
      // Si l'utilisateur a envoyé un message qui n'est pas le mot à trouver,
      // on l'ajoute en tant que message de l'utilisateur en base
      const client = await getClient();
      await insertMessage(client, currentRound.id, MESSAGE_TYPE.USER, text, user.id)
      client.release();
    }
  }

  // Envoyer les informations de la partie à tous les participants
  await sendGameData(user.game_id);

}

export async function userReadyNextRound(_, ws) {
  // On récupère les informations de l'utilisateur
  const user = userRegistry.get(ws);
  const game_id = user.game_id;

  // On vérifie que la game de l'utilisateur est bien en cours
  const game = await getGameById(game_id);
  if (game.state !== GAME_STATE.PROGRESS) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On passe l'utilisateur à l'état Ready
  const client = await getClient();
  setUserReady(client, user.id);
  client.release();

  // Si tous les participants sont prêts, on lance un nouveau round ou on termine la game
  const users = await getActiveUsersByGameId(game_id);
  if (users.every(user => user.ready)) {
    const client = await getClient();
    if (await isGameEnd(game_id)) {
      // Si la game est terminée, on met à jour son statut en base
      await updateGameState(game_id, GAME_STATE.DONE, client)
      await sendGameData(game_id);
    } else {
      // Sinon on démarre un nouveau round
      await startRound(game_id, client, (scores) => {
        return Promise.all([
            sendScores(game_id, scores),
            sendGameData(game_id)
        ])
      });
      await sendGameData(game_id, MSG_TYPE_TO_FRONT.ROUND_START);
      await sendRandomImages(game_id);
      await sendWord(game_id);
    }
    client.release();
  }
}

export async function handleWsClose(ws) {

  // On récupère l'utilisateur concerné
  const user = userRegistry.get(ws);
  if (user == null) return;

  // On supprime la socket du registry des utilisateurs et on le rend inactif en base
  userRegistry.delete(ws);
  const client = await getClient();
  await setUserInactive(client, user.id);
  client.release();

  // On récupère la game concernée
  const game = await getGameById(user.game_id);
  const game_id = game.id;

  // On supprime la websocket du registry de la game
  const gameRegistryData = gameRegistry.get(game_id);
  if (gameRegistryData == null) return;
  gameRegistryData.users = gameRegistryData.users.filter(wsInRegistry => wsInRegistry !== ws);
  if (gameRegistryData.owner === ws) gameRegistryData.owner = null;
  const usersLeft = gameRegistryData.users.length;

  if (game.state === GAME_STATE.PROGRESS) {
    // Si la game est en cours
    if (usersLeft < 2) {
      // S'il reste moins de deux participants
      // On avorte la game
      const client = await getClient();
      await updateGameState(game_id, GAME_STATE.ABORTED, client);
      client.release();
    }
  }

  if (usersLeft === 0) {
    // S'il n'y a plus d'utilisateur dans la game
    // On la supprime du registry
    gameRegistry.delete(game_id);
  }

  await sendGameData(game_id);

}
