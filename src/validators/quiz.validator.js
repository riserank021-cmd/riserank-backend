/**
 * quiz.validator.js
 */

const Joi = require('joi');
const { EXAM_CATEGORIES, DIFFICULTY, CONTENT_STATUS } = require('../config/constants');

const create = Joi.object({
  title: Joi.object({
    en: Joi.string().trim().max(200).required(),
    hi: Joi.string().trim().max(200).required(),
  }).required(),
  description: Joi.object({
    en: Joi.string().trim().allow('').optional(),
    hi: Joi.string().trim().allow('').optional(),
  }).optional(),
  questions: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .max(100)
    .required(),
  examCategory: Joi.string().valid(...Object.values(EXAM_CATEGORIES)).required(),
  difficulty: Joi.string().valid(...Object.values(DIFFICULTY)).default(DIFFICULTY.MEDIUM),
  durationSeconds: Joi.number().integer().min(60).default(600),
  totalMarks: Joi.number().optional().allow(null),
  negativeMarking: Joi.boolean().default(false),
  negativeMarkValue: Joi.number().min(0).max(1).default(0.25),
  isDaily: Joi.boolean().default(false),
  scheduledDate: Joi.when('isDaily', {
    is: true,
    then: Joi.date().required(),
    otherwise: Joi.date().optional().allow(null),
  }),
  status: Joi.string().valid(...Object.values(CONTENT_STATUS)).default(CONTENT_STATUS.DRAFT),
});

const update = create.fork(
  ['title', 'questions', 'examCategory'],
  (schema) => schema.optional()
);

const submitAttempt = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().hex().length(24).required(),
        selectedOption: Joi.string().valid('A', 'B', 'C', 'D', null).allow(null).default(null),
        timeTakenSeconds: Joi.number().min(0).default(0),
      })
    )
    .required(),
  timeTakenSeconds: Joi.number().min(0).required(),
  language: Joi.string().valid('en', 'hi').default('en'),
});

module.exports = { create, update, submitAttempt };
