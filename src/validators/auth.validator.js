/**
 * auth.validator.js
 * Joi schemas for auth routes validation.
 */

const Joi = require('joi');
const { LANGUAGES } = require('../config/constants');

const register = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().messages({
    'string.pattern.base': 'Invalid Indian phone number',
  }),
  preferredLanguage: Joi.string()
    .valid(...Object.values(LANGUAGES))
    .default(LANGUAGES.ENGLISH),
});

const login = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
  device: Joi.string().valid('web', 'android', 'ios').default('web'),
});

const adminLogin = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
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

const forgotPassword = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const verifyOTP = Joi.object({
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must be numeric',
  }),
});

const resetPassword = Joi.object({
  email: Joi.string().email().lowercase().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase and a number',
    }),
});

const googleAuth = Joi.object({
  idToken: Joi.string().required(),
  device: Joi.string().valid('android', 'ios', 'web').default('android'),
});

module.exports = {
  register, login, adminLogin, refreshToken, changePassword,
  forgotPassword, verifyOTP, resetPassword, googleAuth,
};
