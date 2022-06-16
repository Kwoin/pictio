import { getClient, insert } from "./index.js";

export async function insertMessage(client, round_id, type, text, user_id = null) {
  return insert("pictio.message", { round_id, type, text, user_id }, client);
}

export async function getMessagesByGameId(game_id) {
  const client = await getClient();
  const text = "select * from pictio.message as m left join pictio.round as r on m.round_id = r.id where game_id = $1;";
  const result = await client.query(text, [game_id]);
  client.release();
  return result.rows;
}

export async function getMessagesByRoundId(round_id) {
  const client = await getClient();
  const text = "select * from pictio.message where round_id = $1";
  const result = await client.query(text, [round_id]);
  client.release();
  return result.rows;
}
