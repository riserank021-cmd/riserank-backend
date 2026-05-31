/**
 * QuizAttempt.js
 * Records a single user's attempt at a quiz.
 * One document per attempt — a user can reattempt a quiz.
 */

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: String,
      enum: ['A', 'B', 'C', 'D', null],
      default: null, // null = skipped
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },

    // ── Answers ───────────────────────────────────
    answers: [answerSchema],

    // ── Scoring ───────────────────────────────────
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },

    // ── Timing ────────────────────────────────────
    timeTakenSeconds: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    isCompleted: { type: Boolean, default: false },

    // ── Language user attempted in ────────────────
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, createdAt: -1 });
quizAttemptSchema.index({ quiz: 1, score: -1 });
quizAttemptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
