/**
 * LiveTestAttempt.js
 * One attempt per user per live test.
 */

const mongoose = require('mongoose');

const liveTestAttemptSchema = new mongoose.Schema(
  {
    liveTest: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveTest', required: true, index: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers: [
      {
        question:       { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
        isCorrect:      { type: Boolean, default: false },
      },
    ],
    score:            { type: Number, default: 0 },
    correctCount:     { type: Number, default: 0 },
    wrongCount:       { type: Number, default: 0 },
    skippedCount:     { type: Number, default: 0 },
    percentage:       { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    isCompleted:      { type: Boolean, default: false, index: true },
    rank:             { type: Number, default: null },  // computed on submission
    language:         { type: String, enum: ['en', 'hi'], default: 'en' },
    startedAt:        { type: Date, default: Date.now },
    submittedAt:      { type: Date, default: null },
  },
  { timestamps: true }
);

// One attempt per user per test
liveTestAttemptSchema.index({ liveTest: 1, user: 1 }, { unique: true });
// For leaderboard queries
liveTestAttemptSchema.index({ liveTest: 1, isCompleted: 1, score: -1 });

module.exports = mongoose.model('LiveTestAttempt', liveTestAttemptSchema);
