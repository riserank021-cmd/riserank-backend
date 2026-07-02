/**
 * QuestionFeedback.js
 * "Was this helpful?" thumbs up/down vote on a question's explanation, per user.
 * One document per user-question pair — resubmitting updates the existing vote.
 */

const mongoose = require('mongoose');

const questionFeedbackSchema = new mongoose.Schema(
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
    isHelpful: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// One vote per user per question
questionFeedbackSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('QuestionFeedback', questionFeedbackSchema);
