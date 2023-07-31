import { db } from "../database/database.js"

async function getCustomers(req, res) {
  const { cpf, offset, limit, order, desc } = req.query

  let sqlQuery = ` `
  const sqlQueryParams = []

  if (cpf) {
    sqlQueryParams.push(cpf + "%")
    sqlQuery += `WHERE cpf LIKE $${sqlQueryParams.length} `
  }

  if (order) {
    sqlQuery += `ORDER BY customers."${order}" `
    if (desc && desc.toLowerCase() === "true") {
      sqlQuery += `DESC`
    }
  }

  if (offset) {
    sqlQueryParams.push(offset)
    sqlQuery += `OFFSET $${sqlQueryParams.length} `
  }

  if (limit) {
    sqlQueryParams.push(limit)
    sqlQuery += `LIMIT $${sqlQueryParams.length} `
  }

  try {
    const customers = await db.query(
      `SELECT *, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers ${sqlQuery};`,
      sqlQueryParams
    )

    res.send(customers.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

async function addCustomer(req, res) {
  const { name, phone, birthday, cpf } = req.body
  try {
    const customer = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [
      cpf,
    ])
    if (customer.rowCount > 0) return res.status(409).send("Cpf já cadastrado")

    await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)`,
      [name, phone, cpf, birthday]
    )

    return res.sendStatus(201)
  } catch (error) {
    if (
      error instanceof pg.InternalError ||
      error instanceof pg.QueryFailedError
    ) {
      return res.status(500).send("Internal Server Error")
    }
    return res.status(400).send("Bad Request")
  }
}

export { getCustomers, addCustomer }
