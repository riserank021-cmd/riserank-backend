/**
 * Quiz.js
 * A quiz is a curated set of questions with config (timer, category etc.)
 * Daily quizzes are identified by the isDaily flag + scheduledDate.
 */

const mongoose = require('mongoose');
const { CONTENT_STATUS, EXAM_CATEGORIES, DIFFICULTY } = require('../config/constants');

const quizSchema = new mongoose.Schema(
  {
    // ── Bilingual Title ───────────────────────────
    title: {
      en: { type: String, required: true, trim: true, maxlength: 200 },
      hi: { type: String, required: true, trim: true, maxlength: 200 },
    },
    description: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
    },

    // ── Questions ─────────────────────────────────
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],

    // ── Config ────────────────────────────────────
    examCategory: {
      type: String,
      enum: Object.values(EXAM_CATEGORIES),
      required: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY),
      default: DIFFICULTY.MEDIUM,
    },
    durationSeconds: {
      type: Number,
      default: 600, // 10 minutes default
      min: 60,
    },
    totalMarks: {
      type: Number,
      default: null, // If null, 1 mark per question
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    negativeMarkValue: {
      type: Number,
      default: 0.25,
    },

    // ── Daily Quiz ────────────────────────────────
    isDaily: {
      type: Boolean,
      default: false,
    },
    scheduledDate: {
      type: Date,
      default: null, // Set when isDaily = true
    },

    // ── Practice Quiz (auto-generated on-demand) ──
    isPractice: {
      type: Boolean,
      default: false,
    },
    practiceSubject: { type: String, default: null }, // e.g. 'english', 'gk_gs'
    practiceTopic:   { type: String, default: null }, // e.g. 'history', 'synonyms' (null = all topics in subject)

    // ── Status ────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
    },

    // ── Audit ─────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },

    // ── Stats (denormalized) ──────────────────────
    attemptCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Virtual: durationMinutes ──────────────────────────────────────────────────
// Convenience accessor consumed by the mobile app (durationSeconds is the source of truth)
quizSchema.virtual('durationMinutes').get(function () {
  return Math.round(this.durationSeconds / 60);
});

// Serialize virtuals so they appear in JSON API responses
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
quizSchema.index({ status: 1, examCategory: 1 });
quizSchema.index({ isDaily: 1, scheduledDate: -1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ attemptCount: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
