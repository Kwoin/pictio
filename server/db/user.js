import * as db from "./index.js";

export async function getUserById(id) {
  const request = "select * from user where id = $1";
  const params = [id];
  const client = await db.getClient();
  const result = await client.query(request, params);
  client.release();
  return result.rows[0];
}

export async function getUsersByGameId(id) {
  const request = "select * from user where game_id = $1";
  const params = [id];
  const client = await db.getClient();
  const result = await client.query(request, params);
  client.release();
  return result.rows;
}