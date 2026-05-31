/**
 * Question.js
 * MCQ Question with bilingual content.
 * Options and explanation also stored bilingually.
 */

const mongoose = require('mongoose');
const { CONTENT_STATUS, EXAM_CATEGORIES, DIFFICULTY } = require('../config/constants');

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    text: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    // ── Bilingual Question ────────────────────────
    questionText: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Question must have exactly 4 options',
      },
    },
    correctOption: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    explanation: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
    },

    // ── Metadata ──────────────────────────────────
    examCategory: {
      type: String,
      enum: Object.values(EXAM_CATEGORIES),
      required: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY),
      default: DIFFICULTY.MEDIUM,
    },
    year: {
      type: Number, // Year the question appeared in exam (if known)
      default: null,
    },
    tags: [{ type: String, trim: true, lowercase: true }],

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
    correctCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false }, // Flagged for review
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
questionSchema.index({ examCategory: 1, status: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isReported: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ 'questionText.en': 'text', 'questionText.hi': 'text' });

module.exports = mongoose.model('Question', questionSchema);
