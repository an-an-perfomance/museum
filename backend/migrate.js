const db = require('./src/db');

async function migrate() {
  try {
    await db.query('ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "fullDescription" TEXT;');
    console.log('Migration successful: added fullDescription column');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
