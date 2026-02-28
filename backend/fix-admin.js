const bcrypt = require('bcryptjs');
const db = require('./src/db');

async function fixAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT INTO "User" (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password = $2',
      ['admin', hashedPassword, 'ADMIN']
    );
    console.log('Admin password updated successfully! Login: admin, Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error updating admin:', err);
    process.exit(1);
  }
}

fixAdmin();
