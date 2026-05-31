/**
 * ActivityLog.js
 * Audit trail for all significant actions by admins and users.
 * Written by the activityLog middleware — never manually.
 * TTL index auto-deletes logs older than 90 days to control DB size.
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    // ── Actor ─────────────────────────────────────
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'actorModel',
      required: true,
    },
    actorModel: {
      type: String,
      enum: ['User', 'Admin'],
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },

    // ── Action ────────────────────────────────────
    action: {
      type: String,
      required: true,
      // e.g. 'quiz.attempt', 'currentAffair.create', 'user.login'
    },

    // ── Target (optional — what was acted on) ─────
    targetModel: {
      type: String,
      enum: ['User', 'Admin', 'Quiz', 'QuizAttempt', 'CurrentAffair', 'Question', 'Category', null],
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // ── Request Context ───────────────────────────
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    endpoint: { type: String, default: null },
    method: { type: String, default: null },

    // ── Extra metadata ────────────────────────────
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ── Status ────────────────────────────────────
    statusCode: { type: Number, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ actorModel: 1, createdAt: -1 });
activityLogSchema.index({ targetModel: 1, targetId: 1 });

// TTL Index — auto-delete logs after 90 days to keep Atlas storage in check
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('ActivityLog', activityLogSchema);
