/**
 * reset-admin-password.js
 * Force-resets the superadmin password to RiseRank@2024
 * Run: node scripts/reset-admin-password.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
const NEW_PASSWORD = 'RiseRank@2024';

if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

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

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected');

    const hashed = await bcrypt.hash(NEW_PASSWORD, 12);
    const result = await Admin.updateOne(
      { role: 'superadmin' },
      { $set: { password: hashed } }
    );

    if (result.matchedCount === 0) {
      console.log('No superadmin found — creating one...');
      await Admin.create({
        name: 'Super Admin',
        email: 'superadmin@riserank.in',
        password: hashed,
        role: 'superadmin',
      });
      console.log('Created superadmin@riserank.in with password RiseRank@2024');
    } else {
      console.log('Password reset for superadmin. Email: superadmin@riserank.in / RiseRank@2024');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
