/**
 * make-admin.js
 * Promote one or more users to admin or superadmin by email.
 *
 * Usage:
 *   node scripts/make-admin.js email1@example.com email2@example.com
 *   node scripts/make-admin.js --role superadmin email@example.com
 *
 * Defaults to role=admin. Pass --role superadmin to make superadmin.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function main() {
  const args = process.argv.slice(2);

  // Parse --role flag
  let role = 'admin';
  const roleIdx = args.indexOf('--role');
  if (roleIdx !== -1) {
    role = args[roleIdx + 1];
    args.splice(roleIdx, 2);
  }

  const emails = args.filter(a => a.includes('@'));

  if (emails.length === 0) {
    console.error('❌  No emails provided.');
    console.error('   Usage: node scripts/make-admin.js email1@example.com email2@example.com');
    console.error('          node scripts/make-admin.js --role superadmin email@example.com');
    process.exit(1);
  }

  if (!['admin', 'superadmin'].includes(role)) {
    console.error(`❌  Invalid role "${role}". Must be "admin" or "superadmin".`);
    process.exit(1);
  }

  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌  MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log(`\n🔗  Connecting to MongoDB...`);
  await mongoose.connect(MONGO_URI);
  console.log(`✅  Connected.\n`);

  for (const email of emails) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log(`⚠️   Not found: ${email}`);
      continue;
    }
    const prev = user.role;
    user.role = role;
    await user.save();
    console.log(`✅  ${email}  →  ${prev} → ${role}`);
  }

  console.log('\n🎉  Done! Users can now log in to riserank.in/admin\n');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
