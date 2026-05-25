/**
 * seedSuperAdmin.js
 * Creates the initial super admin account in the database.
 * Run once after first deployment:  node scripts/seedSuperAdmin.js
 *
 * Uses these .env variables:
 *   SUPER_ADMIN_EMAIL    (default: superadmin@jansamadhan.com)
 *   SUPER_ADMIN_PASSWORD (default: Admin@1234)
 *   SUPER_ADMIN_NAME     (default: Super Admin)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../src/config/db');

const seed = async () => {
  const email    = process.env.SUPER_ADMIN_EMAIL    || 'superadmin@jansamadhan.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@1234';
  const name     = process.env.SUPER_ADMIN_NAME     || 'Super Admin';

  try {
    // Check if super admin already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(`✅ Super admin already exists (${email}). Skipping.`);
      process.exit(0);
    }

    // Create the super admin
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (id, full_name, email, password, auth_provider, role, status)
       VALUES (?, ?, ?, ?, 'local', 'super_admin', 'active')`,
      [id, name, email, hashedPassword]
    );

    console.log('✅ Super admin created successfully!');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     super_admin`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed super admin:', err.message);
    process.exit(1);
  }
};

seed();
