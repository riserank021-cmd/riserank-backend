/**
 * asyncHandler.js
 * Wraps async route handlers to catch errors and pass to Express error middleware.
 * Eliminates try/catch boilerplate in every controller.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }))
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
