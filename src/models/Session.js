/**
 * Session.js
 * Tracks user app sessions — start time, end time, time spent.
 * Written on login (start) and periodically updated via heartbeat API.
 * Used for analytics: DAU, session duration, time spent on app.
 * TTL index removes sessions older than 180 days.
 */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    // ── Timing ────────────────────────────────────
    startedAt: { type: Date, required: true },
    lastHeartbeatAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // ── Context ───────────────────────────────────
    device: {
      type: String,
      enum: ['web', 'android', 'ios', 'unknown'],
      default: 'unknown',
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },

    // ── Date for daily aggregation ────────────────
    dateKey: {
      type: String, // Format: YYYY-MM-DD — for DAU queries
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
sessionSchema.index({ user: 1, startedAt: -1 });
sessionSchema.index({ dateKey: 1 });
sessionSchema.index({ isActive: 1 });

// TTL: auto-delete sessions older than 180 days
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

module.exports = mongoose.model('Session', sessionSchema);
