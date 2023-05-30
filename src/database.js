import knex from "knex";
import * as dotenv from "dotenv";
dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 0, max: 30 },
});

export default db;
