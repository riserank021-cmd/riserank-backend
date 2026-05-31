/**
 * CurrentAffair.js
 * Bilingual current affairs articles.
 * Content stored as { en: ..., hi: ... } embedded objects.
 */

const mongoose = require('mongoose');
const { CONTENT_STATUS, EXAM_CATEGORIES } = require('../config/constants');

const currentAffairSchema = new mongoose.Schema(
  {
    // ── Bilingual Content ─────────────────────────
    title: {
      en: { type: String, required: true, trim: true, maxlength: 300 },
      hi: { type: String, required: true, trim: true, maxlength: 300 },
    },
    body: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    summary: {
      en: { type: String, trim: true, maxlength: 500 },
      hi: { type: String, trim: true, maxlength: 500 },
    },

    // ── Categorization ────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    examTags: [
      {
        type: String,
        enum: Object.values(EXAM_CATEGORIES),
      },
    ],
    tags: [{ type: String, trim: true, lowercase: true }],

    // ── Media ─────────────────────────────────────
    imageUrl: {
      type: String,
      default: null,
    },

    // ── Status ────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },

    // ── Audit ─────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
      required: true,
    },
    createdByModel: {
      type: String,
      enum: ['Admin'],
      default: 'Admin',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'updatedByModel',
      default: null,
    },
    updatedByModel: {
      type: String,
      enum: ['Admin'],
      default: 'Admin',
    },

    // ── Engagement ────────────────────────────────
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
currentAffairSchema.index({ status: 1, publishedAt: -1 });
currentAffairSchema.index({ examTags: 1 });
currentAffairSchema.index({ category: 1 });
currentAffairSchema.index({ tags: 1 });
currentAffairSchema.index({ createdAt: -1 });
// Text index for search
currentAffairSchema.index({ 'title.en': 'text', 'title.hi': 'text', 'body.en': 'text' });

module.exports = mongoose.model('CurrentAffair', currentAffairSchema);
