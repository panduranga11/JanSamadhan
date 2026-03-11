require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool   = require('../src/config/db');

const EMAIL    = process.env.SUPER_ADMIN_EMAIL;
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const NAME     = process.env.SUPER_ADMIN_NAME || 'Super Admin';

if (!EMAIL || !PASSWORD) {
  console.error('❌ Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in your .env file first.');
  process.exit(1);
}

(async () => {
  try {
    // Check if already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [EMAIL]);
    if (existing.length) {
      console.log('✅ Super admin already exists. Updating password...');
      const hash = await bcrypt.hash(PASSWORD, 10);
      await pool.query('UPDATE users SET password = ?, role = ?, status = ? WHERE email = ?',
        [hash, 'super_admin', 'active', EMAIL]);
      console.log('✅ Password updated successfully!');
    } else {
      const hash = await bcrypt.hash(PASSWORD, 10);
      await pool.query(
        'INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), NAME, EMAIL, hash, 'super_admin', 'active']
      );
      console.log('✅ Super admin created successfully!');
    }

    console.log('');
    console.log('  Email   :', EMAIL);
    console.log('  Password:', PASSWORD);
    console.log('  Role    : super_admin');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
