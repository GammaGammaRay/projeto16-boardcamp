import { db } from "../database/database.js"

async function getGames(req, res) {
    const { name, offset, limit, order, desc } = req.query;
  
    let sqlQuery = ` `;
    const sqlQueryParams = [];
  
    if (name) {
      sqlQueryParams.push(name + "%");
      sqlQuery += `WHERE LOWER(name) LIKE LOWER($${sqlQueryParams.length}) `;
    }
  
    if (order) {
      sqlQuery += ` ORDER BY "${order}" `;
      if (desc && desc.toLowerCase() === "true") {
        sqlQuery += `DESC`;
      }
    }
  
    if (offset) {
      sqlQueryParams.push(offset);
      sqlQuery += `OFFSET $${sqlQueryParams.length} `;
    }
  
    if (limit) {
      sqlQueryParams.push(limit);
      sqlQuery += `LIMIT $${sqlQueryParams.length} `;
    }
  
    try {
      const games = await db.query(
        `SELECT * FROM games ${sqlQuery};`,
        sqlQueryParams
      );
      res.send(games.rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

async function addGame(req, res) {}

export { getGames, addGame }
