const { pool } = require('./src/db');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Adding fullDescription column to Photo table...');
    await pool.query('ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "fullDescription" TEXT');
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
