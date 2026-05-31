/**
 * auth.middleware.js
 * Verifies JWT access token from Authorization header.
 * Attaches decoded user/admin to req.user.
 * Works for both User and Admin models via the 'model' field in token payload.
 */

const { verifyAccessToken } = require('../utils/generateToken');
const { sendUnauthorized } = require('../utils/apiResponse');
const User = require('../models/User');
const Admin = require('../models/Admin');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendUnauthorized(res, 'No token provided. Please log in.');
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendUnauthorized(res, 'Token expired. Please log in again.');
      }
      return sendUnauthorized(res, 'Invalid token.');
    }

    // 3. Find user based on model field in token
    const Model = decoded.model === 'Admin' ? Admin : User;
    const user = await Model.findById(decoded.id).select('+passwordChangedAt');

    if (!user) {
      return sendUnauthorized(res, 'User no longer exists.');
    }

    // 4. Check if account is active
    if (user.isActive === false || user.isSuspended === true) {
      return sendUnauthorized(res, 'Your account has been suspended. Please contact support.');
    }

    // 5. Check if password was changed after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return sendUnauthorized(res, 'Password was recently changed. Please log in again.');
    }

    // 6. Attach to request
    req.user = user;
    req.userModel = decoded.model || 'User';

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return sendUnauthorized(res, 'Authentication failed.');
  }
};

module.exports = { protect };
