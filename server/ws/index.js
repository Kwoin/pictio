import { GAME_STATE, MESSAGE_TYPE, MSG_TYPE_TO_BACK, MSG_TYPE_TO_FRONT } from "../shared/constants.js";
import { getClient, insert, transaction } from "../db/index.js";
import { getGameById, updateGameState } from "../db/game.js";
import { ERROR, PictioError } from "./error.js";
import { getActiveUsersByGameId, getUserById, insertUser, setUserInactive, setUserReady, setUserSuccess } from "../db/user.js";
import { getCurrentRound, isGameEnd, startRound, endRound } from "../services/game.service.js";
import { insertMessage } from "../db/message.js";
import { label } from "../i18n/index.js";
import { checkWord, isRoundEnd } from "../services/round.service.js";
import { sendError, sendMsg, sendGameData, sendWord, sendRandomImages, sendScores, sendPictureHighlight } from "./send.js";
import { gameRegistry, userRegistry, imageRegistry } from "../services/registry.service.js";
import { WebSocketServer } from "ws";
import { newUser } from "../services/user.service.js";

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
    ws.on("close", async message => {
      try {
        handleWsClose(ws);
      } catch (e) {
        console.error(e.message, e.stack.split("\n"));
        if (e.name === "PictioError") {
          await sendError(ws, e)
        }
      }
    })
  });

  return webSocketServer;
}

function dispatch(type) {
  console.log(type);
  if (type === MSG_TYPE_TO_BACK.GAME_CREATE) return gameCreate;
  if (type === MSG_TYPE_TO_BACK.USER_JOIN) return userJoin;
  if (type === MSG_TYPE_TO_BACK.USER_REJOIN) return userRejoin;
  if (type === MSG_TYPE_TO_BACK.USER_LEAVE) return userLeave;
  if (type === MSG_TYPE_TO_BACK.USER_READY) return userReady;
  if (type === MSG_TYPE_TO_BACK.USER_NOT_READY) return userNotReady;
  if (type === MSG_TYPE_TO_BACK.GAME_START) return gameStart;
  if (type === MSG_TYPE_TO_BACK.PLAY_SEND_CARD) return playSendCard;
  if (type === MSG_TYPE_TO_BACK.PLAY_SEND_MESSAGE) return playSendMessage;
  if (type === MSG_TYPE_TO_BACK.USER_READY_NEXT_ROUND) return userReadyNextRound;
  if (type === MSG_TYPE_TO_BACK.PLAY_HIGHLIGHT_PICTURE) return playHighlightPictures;
}

/**
 * Cr??ation d'une nouvelle partie
 * @param payload
 * @param ws
 * @returns {Promise<void>}
 */
async function gameCreate({username}, ws) {

  const result = await transaction(
      // Ins??rer une nouvelle entr??e en base pour la partie
      (client) => insert('pictio.game', {state: GAME_STATE.LOBBY}, client),
      // Ins??rer une nouvelle entr??e en base pour le propri??taire de la partie
      (client, res) => insertUser(client, newUser(res.rows[0].id, true, username))
  )
  const user = result.rows[0];
  const game_id = result.rows[0].game_id;

  // Cr??er une nouvelle entr??e dans les registres
  gameRegistry.set(game_id, {users: [ws], owner: ws});
  userRegistry.set(ws, user);
  imageRegistry.set(game_id, []);

  // R??pondre au propri??taire avec les informations de cr??ation de la nouvelle partie
  const user_id = user.id;
  const gameCreated = {user_id, game_id}
  await sendMsg(ws, MSG_TYPE_TO_FRONT.GAME_CREATED, gameCreated)

  // ??mettre les informations de la partie
  await sendGameData(game_id);

}

async function userJoin({game_id, username}, ws) {
  // V??rifier que la partie demand??e existe bien dans le registry et en base
  const gameRegistryData = gameRegistry.get(game_id);
  if (gameRegistryData == null) throw new PictioError(ERROR.NOT_FOUND);
  const game = await getGameById(game_id);
  if (game == null) throw new PictioError(ERROR.NOT_FOUND);

  // Cr??er l'utilisateur dans la base
  const client = await getClient();
  let user = newUser(game_id, false, username);
  const result = await insertUser(client, user);
  client.release();
  user = result.rows[0];

  // Ajouter la socket de l'utilisateur dans les registres
  gameRegistryData.users = [...gameRegistryData.users, ws];
  userRegistry.set(ws, user);

  // Envoyer l'id de l'utilisateur
  const user_id = user.id;
  const msg = sendMsg(ws, MSG_TYPE_TO_FRONT.GAME_JOINED, {user_id})

  // Envoyer les informations de la partie ?? tous les participants
  await sendGameData(game_id);

}

async function userRejoin({game_id, user_id}, ws) {
  // V??rifier que la partie demand??e existe bien dans le registry et en base
  const gameRegistryData = gameRegistry.get(game_id);
  if (gameRegistryData == null) throw new PictioError(ERROR.NOT_FOUND);
  const game = await getGameById(game_id);
  if (game == null) throw new PictioError(ERROR.NOT_FOUND);

  // V??rifier que la partie n'est pas termin??e
  if (game.state !== GAME_STATE.LOBBY && game.state !== GAME_STATE.PROGRESS) throw new PictioError(ws, ERROR.ILLEGAL_STATE);

  // R??cup??rer l'utilisateur en base
  const user = await getUserById(user_id);
  if (user == null) throw new PictioError(ERROR.NOT_FOUND);

  // Red??clar?? l'utilisateur comme ??tant connect?? et le rajouter dans les registry
  const client = await getClient();
  await setUserInactive(client, user_id, false);
  client.release();
  gameRegistryData.users = [...gameRegistryData.users, ws];
  gameRegistry.set(game_id, gameRegistryData);
  userRegistry.set(ws, user);

  await sendGameData(game_id);
}

async function userLeave(_, ws) {
  // On r??cup??re l'utilisateur concern??
  const user = userRegistry.get(ws);
  if (user == null) return;

  // On le rend inactif en base
  const client = await getClient();
  await setUserInactive(client, user.id);
  client.release();

  // On r??cup??re la game concern??e
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
    imageRegistry.delete(game_id);
  }

  await sendGameData(game_id);
}

async function userReady(_, ws) {
  // On r??cup??re les informations de l'utilisateur
  const user_id = userRegistry.get(ws).id;
  const user = await getUserById(user_id);

  // On v??rifie que la game de l'utilisateur est bien en lobby
  const game = await getGameById(user.game_id);
  if (game.state !== GAME_STATE.LOBBY) throw new PictioError(ERROR.ILLEGAL_STATE);

  if (!user.ready) {
    // Mettre ?? jour l'utilisateur en base
    const client = await getClient();
    setUserReady(client, user.id)
    client.release();

    // Envoyer les informations de la partie ?? tous les participants
    await sendGameData(user.game_id);
  }
}

async function userNotReady(_, ws) {
  // On r??cup??re les informations de l'utilisateur
  const user_id = userRegistry.get(ws).id;
  const user = await getUserById(user_id);

  // On v??rifie que la game de l'utilisateur est bien en lobby
  const game = await getGameById(user.game_id);
  if (game.state !== GAME_STATE.LOBBY) throw new PictioError(ERROR.ILLEGAL_STATE);

  if (user.ready) {
    // Mettre ?? jour l'utilisateur en base
    const client = await getClient();
    setUserReady(client, user.id, false)
    client.release();

    // Envoyer les informations de la partie ?? tous les participants
    await sendGameData(user.game_id);
  }
}

async function gameStart({game_id}, ws) {
  // V??rifier que la partie demand??e existe bien
  const game = await getGameById(game_id);
  if (game == null) throw new PictioError(ERROR.NOT_FOUND);

  // V??rifier que c'est le propri??taire de la partie qui demande le lancement
  const user = userRegistry.get(ws);
  if (!(game.id === user.game_id && user.game_owner)) throw new PictioError(ERROR.UNAUTHORIZED);

  const result = await transaction(
      // 1. Mettre ?? jour le statut de la game
      (client) => updateGameState(game_id, GAME_STATE.PROGRESS, client),
      // 2. Cr??er le round
      (client) => startRound(game_id, client, (scores) => {
        return Promise.all([
            sendScores(game_id, scores),
            sendGameData(game_id),
            sendWord(game_id, false)
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

  // Envoyer les informations de la partie ?? tous les participants
  await sendGameData(game_id, MSG_TYPE_TO_FRONT.ROUND_START);

  // Envoyer des nouvelles images et le mot
  await sendRandomImages(game_id);
  await sendWord(game_id);

}

export async function playSendCard(picture, ws) {
  // Une carte a ??t?? selectionn??e
  // On r??cup??re les informations de l'??metteur
  const user = userRegistry.get(ws);

  // On r??cup??re le round en cours de la game
  const currentRound = await getCurrentRound(user.game_id);
  if (currentRound == null || currentRound.end != null) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On v??rifie que le joueur est bien le joueur solo
  if (currentRound.solo_user_id !== user.id) throw new PictioError(ERROR.UNAUTHORIZED)

  // On enregistre l'image s??lectionn??e en base
  const client = await getClient();
  await insert("pictio.picture", {...picture, round_id: currentRound.id}, client);
  client.release();

  // Envoyer les informations de la partie ?? tous les participants
  await sendGameData(user.game_id);

  // Envoyer des nouvelles images
  await sendRandomImages(user.game_id);
}

export async function playSendMessage({text}, ws) {
  // Un message a ??t?? envoy??
  // On r??cup??re les informations de l'??metteur
  const user = userRegistry.get(ws);
  const game_id = user.game_id;

  // On r??cup??re le round en cours de la game
  const currentRound = await getCurrentRound(game_id);
  if (currentRound == null) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On v??rifie que le joueur n'est pas le joueur solo
  if (currentRound.solo_user_id === user.id) throw new PictioError(ERROR.UNAUTHORIZED)

  if (currentRound.end == null) {
    // Si le round n'est pas termin??, on v??rifie si le message correspond au mot ?? trouver
    if (await checkWord(text, currentRound.id)) {
      // Si l'utilisateur a trouv?? le mot
      const result = await transaction(
          // 1. On assigne success ?? l'utilisateur en base
          (client) => setUserSuccess(user.id, client),
          // 2. On en registre un message de succ??s en base
          (client) => insertMessage(client, currentRound.id, MESSAGE_TYPE.SUCCESS, label("message_success")(user.username))
      )
      if (await isRoundEnd(currentRound.id)) {
        // Si les conditions sont r??unies, on termine le round en cours et on envoie les scores
        const scores = await endRound(game_id, currentRound.id);
        await sendScores(game_id, scores);
        await sendWord(game_id, false);
      }
    } else {
      // Si l'utilisateur a envoy?? un message qui n'est pas le mot ?? trouver,
      // on l'ajoute en tant que message de l'utilisateur en base
      const client = await getClient();
      await insertMessage(client, currentRound.id, MESSAGE_TYPE.USER, text, user.id)
      client.release();
    }
  }

  // Envoyer les informations de la partie ?? tous les participants
  await sendGameData(user.game_id);

}

export async function userReadyNextRound(_, ws) {
  // On r??cup??re les informations de l'utilisateur
  const user = userRegistry.get(ws);
  const game_id = user.game_id;

  // On v??rifie que la game de l'utilisateur est bien en cours
  const game = await getGameById(game_id);
  if (game.state !== GAME_STATE.PROGRESS) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On passe l'utilisateur ?? l'??tat Ready
  const client = await getClient();
  setUserReady(client, user.id);
  client.release();

  // Si tous les participants sont pr??ts, on lance un nouveau round ou on termine la game
  const users = await getActiveUsersByGameId(game_id);
  if (users.every(user => user.ready)) {
    const client = await getClient();
    if (await isGameEnd(game_id)) {
      // Si la game est termin??e, on met ?? jour son statut en base
      await updateGameState(game_id, GAME_STATE.DONE, client)
      await sendGameData(game_id);
    } else {
      // Sinon on d??marre un nouveau round
      await startRound(game_id, client, (scores) => {
        return Promise.all([
            sendScores(game_id, scores),
            sendGameData(game_id),
            sendWord(game_id, false)
        ])
      });
      await sendGameData(game_id, MSG_TYPE_TO_FRONT.ROUND_START);
      await sendRandomImages(game_id);
      await sendWord(game_id);
    }
    client.release();
  }
}

export async function playHighlightPictures(picture_id, ws) {
  // Une image a ??t?? selectionn??e pour ??tre mise en valeur
  // On r??cup??re les informations de l'??metteur
  const user = userRegistry.get(ws);

  // On r??cup??re le round en cours de la game
  const currentRound = await getCurrentRound(user.game_id);
  if (currentRound == null) throw new PictioError(ERROR.ILLEGAL_STATE);

  // On v??rifie que le joueur est bien le joueur solo
  if (currentRound.solo_user_id !== user.id) throw new PictioError(ERROR.UNAUTHORIZED)

  await sendPictureHighlight(user.game_id, picture_id);
}

export async function handleWsClose(ws) {

  // L'utilisateur quitte son ??ventuelle partie en cours
  userLeave(null, ws);
  // On supprime la socket du registry des utilisateurs
  userRegistry.delete(ws);

}
