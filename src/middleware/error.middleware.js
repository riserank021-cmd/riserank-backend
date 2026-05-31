/**
 * error.middleware.js
 * Global error handler — last middleware in the Express chain.
 * Catches all errors thrown by asyncHandler or next(error) calls.
 *
 * Distinguishes between:
 * - Operational errors (AppError) — expected, send clean message
 * - Mongoose errors — cast, validation, duplicate key
 * - JWT errors — already handled in auth middleware but caught here too
 * - Unknown errors — log stack, send generic message in production
 */

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const env = require('../config/env');

// ── Mongoose Error Handlers ────────────────────────────────────────────────────

const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  return new AppError(`Duplicate value for field '${field}': '${value}'. Please use another value.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Validation error: ${messages.join('. ')}`, 400);
};

// ── JWT Error Handlers ────────────────────────────────────────────────────────

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please log in again.', 401);

// ── Response Senders ──────────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Known operational error — safe to expose
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Unknown error — log it, send generic message
    logger.error('UNHANDLED ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// ── Main Error Handler ────────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
  error.message = err.message;

  if (env.isDevelopment) {
    return sendErrorDev(error, res);
  }

  // Transform known Mongoose/JWT errors into AppErrors
  if (error.name === 'CastError') error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateKeyError(error);
  if (error.name === 'ValidationError') error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  return sendErrorProd(error, res);
};

// ── 404 Handler (for unknown routes) ─────────────────────────────────────────
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFoundHandler };
