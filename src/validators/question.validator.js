/**
 * question.validator.js
 */

const Joi = require('joi');
const { EXAM_CATEGORIES, DIFFICULTY, CONTENT_STATUS } = require('../config/constants');

const optionSchema = Joi.object({
  key: Joi.string().valid('A', 'B', 'C', 'D').required(),
  text: Joi.object({
    en: Joi.string().trim().required(),
    hi: Joi.string().trim().required(),
  }).required(),
});

const create = Joi.object({
  questionText: Joi.object({
    en: Joi.string().trim().required(),
    hi: Joi.string().trim().required(),
  }).required(),
  options: Joi.array().items(optionSchema).length(4).required().messages({
    'array.length': 'Exactly 4 options are required',
  }),
  correctOption: Joi.string().valid('A', 'B', 'C', 'D').required(),
  explanation: Joi.object({
    en: Joi.string().trim().allow('').optional(),
    hi: Joi.string().trim().allow('').optional(),
  }).optional(),
  examCategory: Joi.string()
    .valid(...Object.values(EXAM_CATEGORIES))
    .required(),
  subject: Joi.string().trim().optional(),
  topic: Joi.string().trim().optional(),
  difficulty: Joi.string()
    .valid(...Object.values(DIFFICULTY))
    .default(DIFFICULTY.MEDIUM),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear()).optional().allow(null),
  tags: Joi.array().items(Joi.string().lowercase().trim()).optional(),
  status: Joi.string()
    .valid(...Object.values(CONTENT_STATUS))
    .default(CONTENT_STATUS.DRAFT),
});

const update = create.fork(
  ['questionText', 'options', 'correctOption', 'examCategory'],
  (schema) => schema.optional()
);

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  examCategory: Joi.string().valid(...Object.values(EXAM_CATEGORIES)).optional(),
  difficulty: Joi.string().valid(...Object.values(DIFFICULTY)).optional(),
  status: Joi.string().valid(...Object.values(CONTENT_STATUS)).optional(),
  subject: Joi.string().trim().optional(),
  search: Joi.string().trim().max(100).optional(),
});

module.exports = { create, update, listQuery };
