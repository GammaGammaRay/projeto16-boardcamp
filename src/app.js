import cors from "cors"
import { express } from "express"
import router from "./routes/index.routes.js"
const app = express()

app.use(cors())
app.use(express.json())
app.use(router)

const port = 5000
// const port = process.env.PORT || 5000
app.listen(port, () =>
  console.log(chalk.bold.green(`Server running on ${port}`))
);