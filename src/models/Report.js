/**
 * Report.js
 * User-submitted reports on wrong/incorrect questions.
 * Admins review these and fix or remove the question.
 */

const mongoose = require('mongoose');

const REPORT_REASONS = [
  'wrong_answer',
  'unclear_question',
  'typo_or_grammar',
  'wrong_translation',
  'outdated_content',
  'other',
];

const REPORT_STATUS = ['pending', 'reviewed', 'resolved', 'rejected'];

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    status: {
      type: String,
      enum: REPORT_STATUS,
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A user can report the same question multiple times (e.g. different reasons) but
// let's limit to one active report per user-question pair
reportSchema.index({ user: 1, question: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ question: 1 });

module.exports = mongoose.model('Report', reportSchema);
