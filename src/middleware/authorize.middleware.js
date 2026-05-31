/**
 * authorize.middleware.js
 * Role-based authorization. Always used after protect middleware.
 *
 * Usage:
 *   router.post('/admin/create', protect, authorize('superadmin'), controller)
 *   router.get('/content', protect, authorize('admin', 'superadmin'), controller)
 */

const { sendForbidden } = require('../utils/apiResponse');

/**
 * authorize(...roles)
 * Accepts one or more role strings. Passes if req.user.role is in the list.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendForbidden(res, 'Not authenticated.');
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = { authorize };
