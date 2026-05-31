/**
 * activityLog.middleware.js
 * Writes an ActivityLog entry after a response is sent.
 * Non-blocking — never delays the response.
 *
 * Usage (on a specific route):
 *   router.post('/login', authLimiter, logActivity('user.login'), controller)
 *
 * Or automatically in service layer by calling ActivityLogService.log() directly.
 */

const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * logActivity(action, getTargetFn?)
 * @param {string} action - Action constant e.g. 'user.login'
 * @param {Function} [getTargetFn] - Optional fn(req, res) => { targetModel, targetId }
 *                                   Called after response to capture created resource IDs
 */
const logActivity = (action, getTargetFn = null) => {
  return (req, res, next) => {
    // Hook into response finish event — non-blocking
    res.on('finish', async () => {
      try {
        if (!req.user) return; // Only log authenticated actions

        const target = getTargetFn ? getTargetFn(req, res) : {};

        await ActivityLog.create({
          actor: req.user._id,
          actorModel: req.userModel || 'User',
          actorRole: req.user.role,
          action,
          targetModel: target.targetModel || null,
          targetId: target.targetId || null,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          metadata: target.metadata || {},
        });
      } catch (err) {
        // Never let logging failures affect the user
        logger.error(`ActivityLog write failed: ${err.message}`);
      }
    });

    next();
  };
};

module.exports = { logActivity };
