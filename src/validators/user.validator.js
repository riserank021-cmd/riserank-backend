/**
 * user.validator.js
 */

const Joi = require('joi');
const { LANGUAGES, EXAM_CATEGORIES } = require('../config/constants');

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(50).trim().optional(),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .allow('', null)
    .messages({ 'string.pattern.base': 'Invalid Indian phone number' }),
  preferredLanguage: Joi.string()
    .valid(...Object.values(LANGUAGES))
    .optional(),
  preferredExams: Joi.array()
    .items(Joi.string().valid(...Object.values(EXAM_CATEGORIES)))
    .optional(),
  state: Joi.string().trim().max(50).optional().allow('', null),
});

const addBookmark = Joi.object({
  note: Joi.string().trim().max(500).optional().allow('', null),
});

const reportQuestion = Joi.object({
  reason: Joi.string()
    .valid('wrong_answer', 'incorrect_question', 'typo_or_language', 'outdated_content', 'other')
    .required()
    .messages({ 'any.required': 'Reason is required' }),
  note: Joi.string().trim().max(500).optional().allow('', null),
});

const leaderboardQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  periodType: Joi.string().valid('daily', 'weekly', 'alltime').default('daily'),
  examCategory: Joi.string()
    .valid(...Object.values(EXAM_CATEGORIES), 'all')
    .default('all'),
});

module.exports = { updateProfile, addBookmark, reportQuestion, leaderboardQuery };
