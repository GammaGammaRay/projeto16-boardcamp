import { db } from "../database/database.js"

async function getGames(req, res) {
  const { name, offset, limit, order, desc } = req.query

  let sqlQuery = ` `
  const sqlQueryParams = []

  if (name) {
    sqlQueryParams.push(name + "%")
    sqlQuery += `WHERE LOWER(name) LIKE LOWER($${sqlQueryParams.length}) `
  }

  if (offset) {
    sqlQueryParams.push(offset)
    sqlQuery += `OFFSET $${sqlQueryParams.length} `
  }

  if (limit) {
    sqlQueryParams.push(limit)
    sqlQuery += `LIMIT $${sqlQueryParams.length} `
  }

  if (order) {
    sqlQuery += ` ORDER BY "${order}" `
    if (desc && desc.toLowerCase() === "true") {
      sqlQuery += `DESC`
    }
  }

  try {
    const games = await db.query(
      `SELECT * FROM games ${sqlQuery};`,
      sqlQueryParams
    )
    res.send(games.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

async function addGame(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body

  const game = await db.query(`SELECT * FROM games WHERE name = $1;`, [name])
  if (game.rows.length > 0)
    return res.status(409).send("Game already exists")
  await db.query(
    `INSERT INTO games ("name", "image", "stockTotal", "pricePerDay" ) VALUES ($1, $2, $3, $4);`,
    [name, image, stockTotal, pricePerDay]
  )
  res.sendStatus(201)
}

export { getGames, addGame }
