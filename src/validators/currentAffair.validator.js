/**
 * currentAffair.validator.js
 */

const Joi = require('joi');
const { CONTENT_STATUS, EXAM_CATEGORIES } = require('../config/constants');

const bilingualText = (required = true) => {
  const schema = Joi.object({
    en: Joi.string().trim().max(10000),
    hi: Joi.string().trim().max(10000),
  });
  return required ? schema.required() : schema.optional();
};

const create = Joi.object({
  title: Joi.object({
    en: Joi.string().trim().max(300).required(),
    hi: Joi.string().trim().max(300).required(),
  }).required(),
  body: Joi.object({
    en: Joi.string().required(),
    hi: Joi.string().required(),
  }).required(),
  summary: Joi.object({
    en: Joi.string().trim().max(500).optional(),
    hi: Joi.string().trim().max(500).optional(),
  }).optional(),
  category: Joi.string().hex().length(24).optional(),
  examTags: Joi.array()
    .items(Joi.string().valid(...Object.values(EXAM_CATEGORIES)))
    .optional(),
  tags: Joi.array().items(Joi.string().lowercase().trim()).optional(),
  imageUrl: Joi.string().uri().optional().allow('', null),
  status: Joi.string()
    .valid(...Object.values(CONTENT_STATUS))
    .default(CONTENT_STATUS.DRAFT),
});

const update = create.fork(
  ['title', 'body'],
  (schema) => schema.optional()
);

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(...Object.values(CONTENT_STATUS)).optional(),
  examTag: Joi.string().valid(...Object.values(EXAM_CATEGORIES)).optional(),
  category: Joi.string().hex().length(24).optional(),
  tag: Joi.string().trim().max(50).optional(),
  search: Joi.string().trim().max(100).optional(),
  lang: Joi.string().valid('en', 'hi').default('en'),
  language: Joi.string().valid('en', 'hi').optional(),
});

module.exports = { create, update, listQuery };
