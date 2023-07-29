import { Router } from "express"
import rentalRouter from "./rental.routes.js"
import gamesRouter from "./games.routes.js"
import customerRouter from "./customers.routes.js"

const router = Router()

router.use(customerRouter)
router.use(gamesRouter)
router.use(rentalRouter)

export default router
