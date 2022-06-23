import { getClient } from "./index.js";

export async function getRoundsByGameId(game_id) {
  const client = await getClient();
  const result = await client.query("select * from pictio.round where game_id = $1 order by creation desc;", [game_id]);
  client.release();
  return result.rows;
}

export async function getRoundById(round_id) {
  const client = await getClient();
  const result = await client.query("select * from pictio.round where id = $1;", [round_id]);
  client.release();
  return result.rows[0];
}

export async function getRoundsCountGroupedBySoloUserId(solo_user_ids) {
  const client = await getClient();
  const result = await client.query(`select solo_user_id, count(*)
                                     from pictio.round
                                     where solo_user_id = ANY($1::int[])
                                     group by solo_user_id;`, [solo_user_ids])
  client.release();
  return result.rows;
}

export async function setRoundEnd(client, round_id, end = new Date()) {
  await client.query(`update pictio.round set "end" = $1 where id = $2;`, [end, round_id])
}
