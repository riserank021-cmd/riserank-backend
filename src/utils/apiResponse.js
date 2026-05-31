/**
 * apiResponse.js
 * Standardised API response helpers.
 * Every controller uses these — ensures consistent shape across all endpoints.
 *
 * Response shape:
 * {
 *   success: true | false,
 *   message: "...",
 *   data: { ... } | null,
 *   pagination: { ... } | null,   (only on list endpoints)
 *   errors: [ ... ] | null        (only on validation failures)
 * }
 */

const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, pagination = null } = {}) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (pagination !== null) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, { message = 'Created successfully', data = null } = {}) => {
  return sendSuccess(res, { statusCode: 201, message, data });
};

const sendError = (res, { statusCode = 500, message = 'Internal server error', errors = null } = {}) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, { statusCode: 404, message });
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, { statusCode: 401, message });
};

const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, { statusCode: 403, message });
};

const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, { statusCode: 400, message, errors });
};

const sendConflict = (res, message = 'Conflict') => {
  return sendError(res, { statusCode: 409, message });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendBadRequest,
  sendConflict,
};
