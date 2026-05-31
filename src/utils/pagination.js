/**
 * pagination.js
 * Helpers for consistent pagination across all list endpoints.
 */

const { PAGINATION } = require('../config/constants');

/**
 * Parse page + limit from query params with sensible defaults & caps.
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination meta object for the API response.
 */
const buildPaginationMeta = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { getPaginationParams, buildPaginationMeta };
