/**
 * AppError.js
 * Custom error class for operational errors (expected errors we handle).
 * Non-operational errors (bugs, crashes) are handled differently in errorHandler middleware.
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Tells errorHandler this is a known error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
