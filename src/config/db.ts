import { Pool } from 'pg';

export function connect() {
    const {
        DB_USER = '',
        DB_HOST = '',
        DB_NAME = '',
        DB_PASSWORD = '',
        DB_PORT = '',
      } = process.env;
    
      const pool = new Pool({
        user: DB_USER,
        host: DB_HOST,
        database: DB_NAME,
        password: DB_PASSWORD,
        port: parseInt(DB_PORT, 10),
      });

    return pool
}