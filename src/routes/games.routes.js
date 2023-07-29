import { Router } from "express";
import validateSchema from "../middleware/validateSchema.js";
import { addGame, getGames } from "../controllers/games.controller.js";
import schemaGame from "../schemas/games.schemas.js";

const gamesRouter = Router();

gamesRouter.get("/games", getGames)
gamesRouter.post("/games", validateSchema(schemaGame), addGame)

export default gamesRouter;