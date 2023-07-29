import { db } from "../database/database.js"

export async function getCustomers(req, res) {
  try {
    const customers = await db.query(`SELECT * FROM customers;`)
    res.send(customers.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function getCustomerById(req, res) {
  const { customerId } = req.params
  try {
    const customers = await db.query(`SELECT * FROM customers;`)
    res.send(customers.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}
