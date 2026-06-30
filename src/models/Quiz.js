/**
 * Quiz.js
 * A quiz is a curated set of questions with config (timer, category etc.)
 * Daily quizzes are identified by the isDaily flag + scheduledDate.
 */

const mongoose = require('mongoose');
const { CONTENT_STATUS, EXAM_CATEGORIES, DIFFICULTY, QUIZ_TYPES } = require('../config/constants');

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

    // ── Quiz Type ─────────────────────────────────
    // Determines grouping, badge, and filtering in the app.
    quizType: {
      type: String,
      enum: Object.values(QUIZ_TYPES),
      default: QUIZ_TYPES.FULL_LENGTH,
      index: true,
    },

    // ── Exam Phase ────────────────────────────────
    // For exams with multiple stages (Prelims/Mains/CBT1/CBT2 etc.)
    // e.g. 'prelims', 'mains', 'cbt1', 'cbt2', 'tier1', 'tier2', 'descriptive'
    examPhase: {
      type: String,
      default: null,
      trim: true,
    },

    // ── Chapter / Section label ───────────────────
    // Used for chapter tests and sectional tests.
    // e.g. 'Reasoning', 'Quantitative Aptitude', 'General Knowledge'
    chapterOrSection: {
      type: String,
      default: null,
      trim: true,
    },

    // ── PYQ metadata ──────────────────────────────
    // For Previous Year Papers: the year of the actual exam paper.
    pyqYear: {
      type: Number,
      default: null,
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
quizSchema.index({ status: 1, examCategory: 1, quizType: 1 });
quizSchema.index({ isDaily: 1, scheduledDate: -1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ attemptCount: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
