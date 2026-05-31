/**
 * validate.middleware.js
 * Joi schema validation middleware factory.
 * Validates req.body, req.params, or req.query against a Joi schema.
 *
 * Usage:
 *   router.post('/register', validate(authValidators.register), controller)
 *   router.get('/list', validate(listValidators.query, 'query'), controller)
 */

const { sendBadRequest } = require('../utils/apiResponse');

/**
 * validate(schema, source)
 * @param {Object} schema - Joi schema object
 * @param {string} source - 'body' | 'query' | 'params' (default: 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // Return all errors, not just the first
      stripUnknown: true,  // Remove unknown fields from the request
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return sendBadRequest(res, 'Validation failed', errors);
    }

    // Replace req[source] with validated + sanitized value
    req[source] = value;
    next();
  };
};

module.exports = { validate };
