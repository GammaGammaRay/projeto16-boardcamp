import { db } from "../database/database.js"

async function getCustomers(req, res) {
  const { cpf, offset, limit, order, desc } = req.query

  const sqlQueryParams = []
  let sqlQuery = ""

  if (cpf) {
    sqlQuery += "WHERE cpf LIKE $1 "
    sqlQueryParams.push(`${cpf}%`)
  }

  if (order) {
    sqlQuery += `ORDER BY customers."${order}" ${
      desc && desc.toLowerCase() === "true" ? "DESC" : ""
    } `
  }

  if (offset) {
    sqlQuery += "OFFSET $2 "
    sqlQueryParams.push(offset)
  }

  if (limit) {
    sqlQuery += "LIMIT $3 "
    sqlQueryParams.push(limit)
  }

  try {
    const queryText = `SELECT *, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers ${sqlQuery};`
    const customers = await db.query(queryText, sqlQueryParams)

    res.send(customers.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

async function addCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body
  const customer = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [
    cpf,
  ])
  if (customer.rows.length > 0)
    return res.status(409).send("CPF has already been registered")

  await db.query(
    `INSERT INTO customers ("name", "phone", "cpf", "birthday") VALUES ($1, $2, $3, $4);`,
    [name, phone, cpf, birthday]
  )
  res.sendStatus(201)
}

export { getCustomers, addCustomer }
