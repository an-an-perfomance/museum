const { pool } = require('./src/db');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Adding fullDescription column to Photo table...');
    await pool.query('ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "fullDescription" TEXT');
    console.log('Creating Video table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Video" (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        "fullDescription" TEXT,
        filename TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
      )
    `);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
