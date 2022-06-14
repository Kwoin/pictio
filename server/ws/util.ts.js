import { getGameById } from "../db/game.js";
import { getUsersByGameId } from "../db/user.js";

export async function buildGame(id) {
  const game = await getGameById(id);
  const users = await getUsersByGameId(id);
  return { ...game, users };
}
