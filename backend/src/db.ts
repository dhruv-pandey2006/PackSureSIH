import 'dotenv/config';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Add it to backend/.env.');
}

export const pool = new Pool({ connectionString: databaseUrl });

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error);
});