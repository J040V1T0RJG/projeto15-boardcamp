import pkg from "pg";
import dotenv from "dotenv"

dotenv.config();

const { Poll } = pkg;

const connection = new Poll({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });
  console.log(connection)

export default connection