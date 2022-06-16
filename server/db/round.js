import { getClient } from "./index.js";

export async function getRoundsByGameId(game_id) {
  const client = await getClient();
  const result = await client.query("select * from pictio.round where game_id = $1 order by creation", [game_id]);
  client.release();
  return result.rows;
}
