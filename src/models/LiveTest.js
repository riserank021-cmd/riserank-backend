/**
 * LiveTest.js
 * A scheduled live test — everyone attempts at the same time.
 * status: upcoming → live (auto at scheduledAt) → ended (auto at scheduledAt + durationSeconds)
 */

const mongoose = require('mongoose');
const { EXAM_CATEGORIES } = require('../config/constants');

const liveTestSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true, trim: true, maxlength: 200 },
      hi: { type: String, required: true, trim: true, maxlength: 200 },
    },
    description: {
      en: { type: String, trim: true, default: '' },
      hi: { type: String, trim: true, default: '' },
    },
    examCategory: {
      type: String,
      enum: Object.values(EXAM_CATEGORIES),
      required: true,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    scheduledAt: { type: Date, required: true },   // exact start datetime (IST)
    durationSeconds: { type: Number, required: true, min: 60, default: 1800 }, // 30 min default
    totalMarks: { type: Number, default: null },
    negativeMarking: { type: Boolean, default: false },
    negativeMarkValue: { type: Number, default: 0.25 },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended'],
      default: 'upcoming',
      index: true,
    },
    registeredCount: { type: Number, default: 0 },
    participantCount: { type: Number, default: 0 }, // users who submitted
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtual: endAt
liveTestSchema.virtual('endAt').get(function () {
  return new Date(this.scheduledAt.getTime() + this.durationSeconds * 1000);
});

liveTestSchema.set('toJSON', { virtuals: true });
liveTestSchema.set('toObject', { virtuals: true });

// Index for efficient status + time queries
liveTestSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('LiveTest', liveTestSchema);
