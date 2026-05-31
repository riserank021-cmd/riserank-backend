/**
 * category.validator.js
 */

const Joi = require('joi');

const create = Joi.object({
  name: Joi.object({
    en: Joi.string().trim().max(100).required(),
    hi: Joi.string().trim().max(100).required(),
  }).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9_-]+$/)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, hyphens and underscores',
    }),
  description: Joi.object({
    en: Joi.string().trim().max(300).optional().allow(''),
    hi: Joi.string().trim().max(300).optional().allow(''),
  }).optional(),
  icon: Joi.string().uri().optional().allow('', null),
  isActive: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
});

const update = create.fork(
  ['name', 'slug'],
  (schema) => schema.optional()
);

module.exports = { create, update };
