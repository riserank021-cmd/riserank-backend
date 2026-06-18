/**
 * upsert-admins.js
 * Create admin users or update their password if they already exist.
 * Run: node scripts/upsert-admins.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const ADMINS = [
  { email: 'vandankumar94312@gmail.com', name: 'Vandan Kumar' },
  { email: 'ayushraj5230@gmail.com',     name: 'Ayush Raj'    },
  { email: 'shubhamkmr021@gmail.com',    name: 'Shubham Kumar' },
];

const PASSWORD = 'Password@123';
const ROLE     = 'admin';

async function main() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!MONGO_URI) { console.error('❌  MONGODB_URI not set'); process.exit(1); }

  console.log('\n🔗  Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected.\n');

  for (const { email, name } of ADMINS) {
    let user = await User.findOne({ email }).select('+password');

    if (user) {
      // Update password + role
      user.password = PASSWORD;   // pre-save hook will hash it
      user.role     = ROLE;
      user.isEmailVerified = true;
      await user.save();
      console.log(`✅  Updated  : ${email}  (password reset, role → ${ROLE})`);
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: PASSWORD,
        role: ROLE,
        isEmailVerified: true,
        authProvider: 'local',
      });
      console.log(`🆕  Created  : ${email}  (role: ${ROLE})`);
    }
  }

  console.log('\n🎉  Done! All users can now log in to riserank.in/admin\n');
  await mongoose.disconnect();
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
