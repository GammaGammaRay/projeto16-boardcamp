import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const configDatabase = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === "production") configDatabase.ssl = true;

const db = new Pool(configDatabase);

try {
  await db.connect();
  console.log("PostGreSQL db connected!");
} catch (err) {
  (err) => console.log("ERROR:", err.message || err);
}

export { db };


// async function testConnection() {
//   try {
//     const client = await db.connect()
//     console.log("Connected successfully!")
//     client.release()
//   } catch (error) {
//     console.error("Error connecting to the database:", error)
//   } finally {
//     db.end()
//   }
// }

// testConnection()
