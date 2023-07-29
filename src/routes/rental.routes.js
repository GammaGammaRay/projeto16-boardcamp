import { Router } from "express"
import validateSchema from "../middleware/validateSchema.js"
import { addGame, getGames } from "../controllers/games.controller.js"
import schemaGame from "../schemas/games.schemas.js"

const rentalRouter = Router()

rentalRouter.get("/rentals", getGames)
rentalRouter.post("/rentals", validateSchema(schemaGame), addGame)
rentalRouter.post("/rentals/:id/return", validateSchema(schemaGame), addGame)
rentalRouter.delete("/rentals/:id", validateSchema(schemaGame), addGame)

export default rentalRouter
