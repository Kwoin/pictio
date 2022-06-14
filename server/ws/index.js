import { GAME_STATE, MSG_TYPE_TO_BACK, MSG_TYPE_TO_FRONT, wsMsg }  from "./constants.js";
import * as db from "../db/index.js"
import { buildGame } from "./util.ts.js";

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
}

async function gameCreate(payload, ws) {

  let gameId = null;
  const result = await db.transaction(
      (client) => db.insert("pictio.game", { state: GAME_STATE.LOBBY })(client),
      (client, res) => {
        gameId = res.rows[0].id;
        return db.insert("pictio.user", {
          game_id: gameId,
          game_owner: true,
          lobby_ready: false,
          game_score: 0,
          username: payload.username
        })
      }
  )

  console.log(gameId)
  const game = buildGame(game_id);
  if (game != null) {
    return wsMsg(MSG_TYPE_TO_FRONT.GAME_CREATED, game)
  }

}


