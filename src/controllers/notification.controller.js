/**
 * notification.controller.js
 * User: register/remove FCM token, toggle notifications.
 * Admin/SuperAdmin: send broadcast notifications.
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const notificationService = require('../services/notification.service');
const User = require('../models/User');

// ── User: Register FCM token ──────────────────────────────────────────────────
const registerToken = asyncHandler(async (req, res) => {
  const { token, device } = req.body;
  if (!token) throw new AppError('FCM token is required', 400);

  await notificationService.registerToken(req.user._id, token, device || 'android');
  return sendSuccess(res, { message: 'Notification token registered' });
});

// ── User: Remove FCM token (on logout) ────────────────────────────────────────
const removeToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new AppError('FCM token is required', 400);

  await notificationService.removeToken(req.user._id, token);
  return sendSuccess(res, { message: 'Token removed' });
});

// ── User: Toggle notifications on/off ────────────────────────────────────────
const toggleNotifications = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') throw new AppError('enabled must be a boolean', 400);

  await User.findByIdAndUpdate(req.user._id, { notificationsEnabled: enabled });
  return sendSuccess(res, {
    message: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
    data: { notificationsEnabled: enabled },
  });
});

// ── Admin: Send broadcast notification ───────────────────────────────────────
const sendBroadcast = asyncHandler(async (req, res) => {
  const { title, body, examCategory, data } = req.body;

  if (!title || !body) throw new AppError('title and body are required', 400);

  const notification = { title, body, data: data || {} };

  if (examCategory && examCategory !== 'all') {
    await notificationService.broadcastToCategory(examCategory, notification);
  } else {
    await notificationService.broadcastToAll(notification);
  }

  return sendSuccess(res, { message: 'Broadcast sent' });
});

// ── Admin: Send notification to a specific user ───────────────────────────────
const sendToUser = asyncHandler(async (req, res) => {
  const { title, body, data } = req.body;
  if (!title || !body) throw new AppError('title and body are required', 400);

  await notificationService.sendToUser(req.params.userId, { title, body, data: data || {} });
  return sendSuccess(res, { message: 'Notification sent to user' });
});

module.exports = {
  registerToken,
  removeToken,
  toggleNotifications,
  sendBroadcast,
  sendToUser,
};
