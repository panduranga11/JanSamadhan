/**
 * Links an email+password to an existing Google-only account.
 * Run: node scripts/linkPassword.js
 *
 * After running, the account can log in with BOTH Google AND email/password.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

// ── Configure here ────────────────────────────────────────
const TARGET_EMAIL = 'pandurangabollepalli@gmail.com';
const NEW_PASSWORD = 'Admin@1234';   // Must have 1 uppercase + 1 digit, ≥8 chars
const NEW_ROLE     = 'super_admin';  // Also promote to super_admin
// ──────────────────────────────────────────────────────────

async function main() {
  const pool = await mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, auth_provider, role FROM users WHERE email = ?',
      [TARGET_EMAIL]
    );

    if (!rows.length) {
      console.error(`\n❌ No user found with email: ${TARGET_EMAIL}\n`);
      process.exit(1);
    }

    const user = rows[0];
    const hashed = await bcrypt.hash(NEW_PASSWORD, 12);

    // Set password, mark as 'both' provider, optionally promote role
    const newProvider = user.auth_provider === 'local' ? 'local' : 'both';
    await pool.query(
      'UPDATE users SET password = ?, auth_provider = ?, role = ? WHERE id = ?',
      [hashed, newProvider, NEW_ROLE, user.id]
    );

    console.log('\n✅ Done!');
    console.log('──────────────────────────────────────────');
    console.log(`   Name     : ${user.full_name}`);
    console.log(`   Email    : ${user.email}`);
    console.log(`   Password : ${NEW_PASSWORD}`);
    console.log(`   Provider : ${newProvider}  (Google + Password)`);
    console.log(`   Role     : ${NEW_ROLE}`);
    console.log('──────────────────────────────────────────');
    console.log('   ⚠️  Change this password after first login.\n');

  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
