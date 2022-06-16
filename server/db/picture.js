import { getClient } from "./index.js";

export async function getPicturesOfLastRoundByGameId(game_id) {
  const client = await getClient();
  const text = `
      select *
      from pictio.picture
      where round_id = (select id
                        from pictio.round
                        where game_id = $1
                        order by creation desc limit 1)
  `
  const result = await client.query(text, [game_id]);
  client.release();
  return result.rows;
}
