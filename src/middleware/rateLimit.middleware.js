/**
 * rateLimit.middleware.js
 * Rate limiting using express-rate-limit.
 * Different limits for different route groups.
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { sendError } = require('../utils/apiResponse');

// ── Generic rate limit message handler ───────────────────────────────────────
const rateLimitHandler = (req, res) => {
  sendError(res, {
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again later.',
  });
};

// ── Global API rate limiter (all routes) ─────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => env.isDevelopment && req.ip === '127.0.0.1', // Skip in local dev
});

// ── Auth routes limiter (stricter) ───────────────────────────────────────────
// Only 10 login/register attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, {
      statusCode: 429,
      message: 'Too many auth attempts from this IP. Please try again in 15 minutes.',
    });
  },
});

// ── Quiz submission limiter ───────────────────────────────────────────────────
// Prevent rapid quiz re-submission abuse
const quizSubmitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { globalLimiter, authLimiter, quizSubmitLimiter };
