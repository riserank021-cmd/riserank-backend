/**
 * seedSuperAdmin.js
 * One-time script to create the first Super Admin account.
 * Run ONCE on a fresh deployment:
 *   node scripts/seedSuperAdmin.js
 *
 * It will:
 *  1. Connect to MongoDB using MONGO_URI from .env
 *  2. Check if a Super Admin already exists (safe to re-run)
 *  3. Create the Super Admin if none found
 *  4. Print credentials and exit
 *
 * ⚠️  Change the default password immediately after first login.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Inline minimal config (avoids circular env deps) ─────────────────────────
const MONGO_URI = process.env.MONGO_URI;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not set in .env');
  process.exit(1);
}

// ── Admin schema (inline — avoids importing full model tree) ──────────────────
const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: String,
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, versionKey: false }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

// ── Seed data — change before running if you want custom values ────────────────
const SUPER_ADMIN_DATA = {
  name: 'Super Admin',
  email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@riserank.in',
  password: process.env.SUPER_ADMIN_PASSWORD || 'RiseRank@2024',
  role: 'superadmin',
};

const seed = async () => {
  try {
    console.log('\n🔗  Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅  Connected\n');

    // Check if super admin already exists
    const existing = await Admin.findOne({ role: 'superadmin' });
    if (existing) {
      console.log(`ℹ️   Super Admin already exists: ${existing.email}`);
      console.log('    No changes made. Exiting.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_DATA.password, SALT_ROUNDS);

    // Create super admin
    const admin = await Admin.create({
      name: SUPER_ADMIN_DATA.name,
      email: SUPER_ADMIN_DATA.email,
      password: hashedPassword,
      role: 'superadmin',
    });

    console.log('✅  Super Admin created successfully!');
    console.log('─────────────────────────────────────');
    console.log(`   Name  : ${admin.name}`);
    console.log(`   Email : ${admin.email}`);
    console.log(`   Pass  : ${SUPER_ADMIN_DATA.password}`);
    console.log(`   Role  : ${admin.role}`);
    console.log('─────────────────────────────────────');
    console.log('⚠️   IMPORTANT: Change the password after first login!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌  Seed failed: ${err.message}`);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

seed();
