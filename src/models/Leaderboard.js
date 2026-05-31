/**
 * Leaderboard.js
 * Daily snapshot leaderboard — not real-time.
 * A cron job (or on-quiz-complete trigger) writes/updates these entries.
 * This avoids expensive real-time aggregations on every leaderboard view.
 */

const mongoose = require('mongoose');
const { EXAM_CATEGORIES } = require('../config/constants');

const leaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Period ────────────────────────────────────
    periodType: {
      type: String,
      enum: ['daily', 'weekly', 'alltime'],
      required: true,
    },
    periodDate: {
      type: Date,  // For daily: start of that day. For weekly: start of that week.
      required: true,
    },

    // ── Scope ─────────────────────────────────────
    examCategory: {
      type: String,
      enum: [...Object.values(EXAM_CATEGORIES), 'all'],
      default: 'all',
    },

    // ── Score ─────────────────────────────────────
    score: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
leaderboardSchema.index({ periodType: 1, periodDate: -1, score: -1 });
leaderboardSchema.index({ periodType: 1, examCategory: 1, periodDate: -1, score: -1 });
leaderboardSchema.index({ user: 1, periodType: 1, periodDate: -1 });
// Compound unique: one entry per user per period per category
leaderboardSchema.index(
  { user: 1, periodType: 1, periodDate: 1, examCategory: 1 },
  { unique: true }
);

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
