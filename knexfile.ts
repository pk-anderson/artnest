import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config(); 

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  migrations: {
    directory: './src/migrations', 
  },
};

export default config;