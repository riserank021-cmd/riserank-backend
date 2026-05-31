/**
 * User.js
 * Represents a regular user (student) on the platform.
 * Admins are managed separately in Admin.js.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, LANGUAGES, EXAM_CATEGORIES } = require('../config/constants');
const env = require('../config/env');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
      sparse: true, // Allow null but enforce uniqueness when present
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },
    // ── OAuth ──────────────────────────────────────────────────────────────────
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    preferredLanguage: {
      type: String,
      enum: Object.values(LANGUAGES),
      default: LANGUAGES.ENGLISH,
    },
    preferredExams: [
      {
        type: String,
        enum: Object.values(EXAM_CATEGORIES),
      },
    ],

    // ── Profile ──────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      trim: true,
    },

    // ── Account Status ────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      default: null,
    },

    // ── Streak Tracking ───────────────────────────
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },

    // ── Refresh Token ─────────────────────────────
    refreshToken: {
      type: String,
      select: false,
    },

    // ── OTP (for email verification + password reset) ─
    otp: {
      code: { type: String, select: false },
      purpose: { type: String, enum: ['email_verification', 'password_reset'], select: false },
      expiresAt: { type: Date, select: false },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ── Password Reset ────────────────────────────
    passwordChangedAt: {
      type: Date,
    },

    // ── Session tracking (last seen) ──────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIP: {
      type: String,
      default: null,
    },

    // ── Push Notifications (FCM) ──────────────────
    fcmTokens: [
      {
        token: { type: String },
        device: { type: String, enum: ['web', 'android', 'ios'], default: 'android' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    notificationsEnabled: { type: Boolean, default: true },

    // ── Stats (denormalized for quick reads) ──────
    totalQuizAttempts: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalAnswered: { type: Number, default: 0 },   // questions attempted (not skipped)
    totalTimeSpentSeconds: { type: Number, default: 0 },
  },
  {
    timestamps: true,   // Adds createdAt, updatedAt
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// email: unique index is already created by `unique: true` in the field definition
// phone: sparse index is already handled by `sparse: true` in the field definition
userSchema.index({ isActive: 1 });
userSchema.index({ currentStreak: -1 });
userSchema.index({ createdAt: -1 });

// ── Pre-save Hook: Hash password ──────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
  this.passwordChangedAt = new Date();
  next();
});

// ── Instance Method: Compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Check if JWT was issued before password change ───────────
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedAt;
  }
  return false;
};

// ── Instance Method: Update daily streak ─────────────────────────────────────
userSchema.methods.updateStreak = function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!this.lastActiveDate) {
    this.currentStreak = 1;
    this.longestStreak = 1;
    this.lastActiveDate = today;
    return;
  }

  const lastActive = new Date(this.lastActiveDate);
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const diffMs = today - lastActiveDay;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already logged in today — no change
    return;
  } else if (diffDays === 1) {
    // Consecutive day
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    // Streak broken
    this.currentStreak = 1;
  }

  this.lastActiveDate = today;
};

module.exports = mongoose.model('User', userSchema);
