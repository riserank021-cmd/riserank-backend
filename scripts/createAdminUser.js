/**
 * createAdminUser.js
 * Creates a User account with superadmin role for mobile app login.
 * Run: node scripts/createAdminUser.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: { type: String, default: 'user' },
  authProvider: { type: String, default: 'local' },
  isEmailVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  preferredLanguage: { type: String, default: 'en' },
  preferredExams: [String],
  avatar: { type: String, default: null },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalQuizAttempts: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  totalAnswered: { type: Number, default: 0 },
  totalTimeSpentSeconds: { type: Number, default: 0 },
  notificationsEnabled: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

const EMAIL    = 'admin@riserank.in';
const PASSWORD = 'Admin@RiseRank2024';
const ROLE     = 'superadmin';

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB\n');

  const existing = await User.findOne({ email: EMAIL }).select('+password');
  if (existing) {
    existing.role = ROLE;
    existing.isEmailVerified = true;
    existing.isActive = true;
    existing.isSuspended = false;
    await existing.save();
    console.log('✅  Existing user updated to superadmin');
    console.log('   Email:', EMAIL);
    console.log('   Role :', ROLE);
    console.log('\n⚠️  Password unchanged — use the original password you registered with.');
  } else {
    const hash = await bcrypt.hash(PASSWORD, 12);
    await User.create({
      name: 'Super Admin',
      email: EMAIL,
      password: hash,
      role: ROLE,
      authProvider: 'local',
      isEmailVerified: true,
      preferredLanguage: 'en',
      preferredExams: [],
    });
    console.log('✅  Admin user created!');
    console.log('──────────────────────────────');
    console.log('   Email   :', EMAIL);
    console.log('   Password:', PASSWORD);
    console.log('   Role    :', ROLE);
    console.log('──────────────────────────────');
    console.log('\nUse these credentials to log into the mobile app.');
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
