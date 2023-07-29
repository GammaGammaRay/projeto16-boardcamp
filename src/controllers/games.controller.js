import { db } from "../database/database.js"

async function getGames(req, res) {
    const { name, offset, limit, order, desc } = req.query;
}

async function addGame(req, res) {}

export { getGames, addGame }
