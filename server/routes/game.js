import express from "express";
import { buildGame } from "../services/game.service.js";
import { getGameById } from "../db/game.js";
import { gameRegistry } from "../services/registry.service.js";

export const gameRouter = express.Router();

gameRouter.get("/:id", async (req, res) => {
  const id = +req.params.id;
  if (gameRegistry.get(id) == null) {
    res.sendStatus(404);
    return;
  }
  const game = await getGameById(id);
  if (game == null) {
    res.sendStatus(404);
    return;
  }
  const result = await buildGame(id);
  res.json(result);
})
