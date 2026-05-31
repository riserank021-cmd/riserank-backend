/**
 * admin.validator.js
 */

const Joi = require('joi');

const createAdmin = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase and a number',
    }),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'New password must contain uppercase, lowercase and a number',
    }),
});

const suspendUser = Joi.object({
  reason: Joi.string().trim().max(200).required().messages({
    'any.required': 'Suspension reason is required',
  }),
});

const reviewReport = Joi.object({
  status: Joi.string().valid('reviewed', 'resolved', 'rejected').required(),
  reviewNote: Joi.string().trim().max(500).optional().allow('', null),
});

module.exports = { createAdmin, changePassword, suspendUser, reviewReport };
