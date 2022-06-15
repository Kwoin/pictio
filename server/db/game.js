import * as db from "./index.js";

export async function getGameById(id) {
  const request = "select * from pictio.game where id = $1";
  const params = [id];
  const client = await db.getClient();
  const result = await client.query(request, params);
  client.release();
  return result.rows[0];
}
