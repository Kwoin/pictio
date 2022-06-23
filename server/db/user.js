import * as db from "./index.js";

export async function getUserById(id) {
  const request = "select * from pictio.user where id = $1;";
  const params = [id];
  const client = await db.getClient();
  const result = await client.query(request, params);
  client.release();
  return result.rows[0];
}

export async function getUsersByGameId(id) {
  const request = "select * from pictio.user where game_id = $1 order by username;";
  const params = [id];
  const client = await db.getClient();
  const result = await client.query(request, params);
  client.release();
  return result.rows;
}

export async function getActiveUsersByGameId(id) {
  const request = "select * from pictio.user where game_id = $1 and connected = true order by username;";
  const params = [id];
  const client = await db.getClient();
  const result = await client.query(request, params);
  client.release();
  return result.rows;
}

export async function setUserSuccess(user_id, client) {
  const success = new Date();
  return client.query("update pictio.user set success = $1 where id = $2;", [success, user_id]);
}

export async function setUserReady(client, user_id, ready = true) {
  return client.query("update pictio.user set ready = $1 where id = $2;", [ready, user_id]);
}

export async function setUserScore(client, user_id, score) {
  return client.query("update pictio.user set game_score = $1 where id = $2;", [score, user_id]);
}

export async function setUserInactive(client, user_id) {
  return client.query("update pictio.user set connected = false where id = $1;", [user_id]);
}
