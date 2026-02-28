import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({ connectionString: env.databaseUrl });

const CREATE_PHOTOS_TABLE = `
  CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(CREATE_PHOTOS_TABLE);
  } finally {
    client.release();
  }
}
