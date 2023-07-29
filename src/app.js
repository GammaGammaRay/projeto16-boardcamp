import cors from "cors"
import express from "express"
import router from "./routes/index.routes.js"

// SERVER INIT
const app = express() 
app.use(cors())
app.use(express.json())
app.use(router)

// SERVER LISTENER
const port = process.env.PORT || 5000
app.listen(port, () =>
  console.log(`Server running on ${port}`)
)
