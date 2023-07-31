import { db } from "../database/database.js"
import dayjs from "dayjs"

function filterByCustomerId(query, queryParams, customerId) {
  if (customerId) {
    query += ` WHERE rentals."customerId" = $${queryParams.length + 1}`
    queryParams.push(customerId)
  }
  return query
}

function filterByGameId(query, queryParams, gameId) {
  if (gameId) {
    query += query.includes("WHERE") ? " AND " : " WHERE "
    query += `rentals."gameId" = $${queryParams.length + 1}`
    queryParams.push(gameId)
  }
  return query
}

function filterByStatus(query, status) {
  if (status) {
    if (status === "open") {
      query += query.includes("WHERE") ? " AND " : " WHERE "
      query += 'rentals."returnDate" IS NULL'
    } else if (status === "closed") {
      query += query.includes("WHERE") ? " AND " : " WHERE "
      query += 'rentals."returnDate" IS NOT NULL'
    }
  }
  return query
}

function filterByStartDate(query, queryParams, startDate) {
  if (startDate) {
    query += query.includes("WHERE") ? " AND " : " WHERE "
    query += 'rentals."rentDate" >= $' + (queryParams.length + 1)
    queryParams.push(startDate)
  }
  return query
}

async function getRentals(req, res) {
  const { offset, limit, order, desc, customerId, gameId, status, startDate } =
    req.query

  try {
    let query = `
      SELECT 
        rentals.*,
        customers.name AS "customerName",
        games.name AS "gameName"
      FROM rentals
      JOIN customers ON rentals."customerId" = customers.id
      JOIN games ON rentals."gameId" = games.id
    `
    const queryParams = []

    query = filterByCustomerId(query, queryParams, customerId)
    query = filterByGameId(query, queryParams, gameId)
    query = filterByStatus(query, status)
    query = filterByStartDate(query, queryParams, startDate)

    if (order) {
      query += ` ORDER BY "${order}"`
      if (desc && desc.toLowerCase() === "true") {
        query += " DESC"
      }
    }

    if (limit) {
      query += ` LIMIT ${limit}`
      if (offset) {
        query += ` OFFSET ${offset}`
      }
    }

    const rentals = await db.query(query, queryParams)

    const allRentals = rentals.rows.map((rent) => ({
      ...rent,
      returnDate:
        rent.returnDate == null
          ? null
          : dayjs(rent.returnDate).format("YYYY-MM-DD"),
      rentDate: dayjs(rent.rentDate).format("YYYY-MM-DD"),
      customer: {
        id: rent.customerId,
        name: rent.customerName,
      },
      game: {
        id: rent.gameId,
        name: rent.gameName,
      },
    }))

    return res.send(allRentals)
  } catch (error) {
    console.log(error.message)
    return res.status(500).send(error.message)
  }
}

async function openRental(req, res) {
  const { customerId, gameId, daysRented } = req.body

  try {
    if (!daysRented || daysRented <= 0) {
      return res.status(400).send("O campo daysRented tem que ser maior que 0!")
    }

    const customers = await db.query(`SELECT * FROM customers WHERE id=$1;`, [
      customerId,
    ])
    if (customers.rowCount === 0) {
      return res.status(400).send("Cliente inexistente!")
    }

    const game = await db.query(`SELECT * FROM games WHERE id=$1;`, [gameId])
    if (!game.rows[0]) {
      return res.status(400).send("Jogo inexistente!")
    }

    const rentalCountResult = await db.query(
      `SELECT COUNT(*) FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL;`,
      [gameId]
    )
    const rentalCount = Number(rentalCountResult.rows[0].count)

    if (
      game.rows[0].stockTotal <= 0 ||
      rentalCount >= game.rows[0].stockTotal
    ) {
      return res.status(400).send("Todos os jogos já foram alugados!")
    }

    await db.query(
      `UPDATE games SET "stockTotal" = "stockTotal" - 1 WHERE id = $1`,
      [gameId]
    )

    const pricePerDay = game.rows[0].pricePerDay

    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice", "returnDate", "delayFee") VALUES ($1, $2, $3, $4, $5, null, null);`,
      [
        customerId,
        gameId,
        daysRented,
        dayjs().format("YYYY-MM-DD"),
        pricePerDay * daysRented,
      ]
    )

    return res.sendStatus(201)
  } catch (error) {
    console.log(error.message)
    return res.status(500).send(error.message)
  }
}

async function closeRental(req, res) {
  const { id } = req.params

  if (!id || id == "") {
    return res.sendStatus(404)
  }

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id])
    if (rental.rowCount === 0) {
      return res.status(404).send("Aluguel não existe!")
    }

    if (rental.rows[0].returnDate !== null) {
      return res.status(400).send("Esse aluguel já foi devolvido!")
    }

    const { originalPrice, daysRented, rentDate } = rental.rows[0]
    const pricePerDay = originalPrice / daysRented
    let delayFee = null

    const daysDifference = dayjs().diff(dayjs(rentDate), "days")
    if (daysDifference > daysRented) {
      delayFee = pricePerDay * (daysDifference - daysRented)
    }

    await db.query(
      `UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;`,
      [dayjs().format("YYYY-MM-DD"), delayFee, id]
    )

    return res.sendStatus(200)
  } catch (error) {
    console.log(error.message)
    return res.status(500).send(error.message)
  }
}

async function eraseRental(req, res) {
  const { id } = req.params

  if (!id || id == "") {
    return res.sendStatus(404)
  }

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id])
    if (rental.rowCount === 0) {
      return res.status(404).send("Aluguel não existe!")
    }

    if (rental.rows[0].returnDate !== null) {
      await db.query(`DELETE FROM rentals WHERE id=$1;`, [id])
      return res.sendStatus(200)
    }

    return res.sendStatus(400)
  } catch (error) {
    console.log(error.message)
    return res.status(500).send(error.message)
  }
}

export { getRentals, openRental, closeRental, eraseRental }
