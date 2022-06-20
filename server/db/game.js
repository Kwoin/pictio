import * as db from "./index.js";

export async function getGameById(id) {
  const request = "select * from pictio.game where id = $1;";
  const params = [id];
  const client = await db.getClient();
  const result = await client.query(request, params);
  client.release();
  return result.rows[0];
}

export async function updateGameState(game_id, state, client) {
  return client.query("update pictio.game set state = $1 where id = $2;", [state, game_id]);
}

export async function resetGameUsers(game_id, client) {
  return client.query("update pictio.user set success = null, ready = false where game_id = $1;", [game_id]);
}

