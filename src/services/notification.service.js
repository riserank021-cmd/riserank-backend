/**
 * notification.service.js
 * Firebase Cloud Messaging (FCM) push notification service.
 * Uses firebase-admin SDK for server-side sending.
 *
 * Falls back gracefully if Firebase is not configured (logs a warning).
 * This means the app won't crash in dev without FCM set up.
 */

const User = require('../models/User');
const logger = require('../utils/logger');
const env = require('../config/env');

// ── Firebase Admin SDK (lazy-init) ────────────────────────────────────────────
let firebaseAdmin = null;

const getFirebaseAdmin = () => {
  if (firebaseAdmin) return firebaseAdmin;

  if (!env.FIREBASE_SERVER_KEY) {
    logger.warn('[FCM] FIREBASE_SERVER_KEY not configured — push notifications disabled');
    return null;
  }

  try {
    const admin = require('firebase-admin');

    // Accept either a JSON string (for env var) or a file path
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(env.FIREBASE_SERVER_KEY);
    } catch {
      serviceAccount = require(env.FIREBASE_SERVER_KEY);
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    firebaseAdmin = admin;
    logger.info('[FCM] Firebase Admin SDK initialized');
    return firebaseAdmin;
  } catch (err) {
    logger.error(`[FCM] Firebase init failed: ${err.message}`);
    return null;
  }
};

// ── Send to a single FCM token ────────────────────────────────────────────────
const sendToToken = async (token, { title, body, data = {} }) => {
  const admin = getFirebaseAdmin();
  if (!admin) return { success: false, reason: 'FCM not configured' };

  try {
    const response = await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    return { success: true, messageId: response };
  } catch (err) {
    // Token invalid/expired — caller should remove it
    if (err.code === 'messaging/registration-token-not-registered') {
      return { success: false, reason: 'invalid_token', error: err.message };
    }
    return { success: false, reason: err.message };
  }
};

// ── Send to a single user (all their devices) ─────────────────────────────────
const sendToUser = async (userId, notification) => {
  const user = await User.findById(userId).select('fcmTokens notificationsEnabled name');
  if (!user || !user.notificationsEnabled || !user.fcmTokens?.length) return;

  const invalidTokens = [];
  for (const tokenEntry of user.fcmTokens) {
    const result = await sendToToken(tokenEntry.token, notification);
    if (!result.success && result.reason === 'invalid_token') {
      invalidTokens.push(tokenEntry.token);
    }
  }

  // Clean up expired tokens
  if (invalidTokens.length) {
    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: { token: { $in: invalidTokens } } },
    });
  }
};

// ── Broadcast to multiple users ───────────────────────────────────────────────
const sendToUsers = async (userIds, notification) => {
  await Promise.allSettled(userIds.map((id) => sendToUser(id, notification)));
};

// ── Broadcast to all users with a specific exam category preference ───────────
const broadcastToCategory = async (examCategory, notification) => {
  const users = await User.find({
    preferredExams: examCategory,
    notificationsEnabled: true,
    'fcmTokens.0': { $exists: true },
  }).select('_id').lean();

  logger.info(`[FCM] Broadcasting to ${users.length} users in category: ${examCategory}`);
  await sendToUsers(users.map((u) => u._id), notification);
};

// ── Broadcast to ALL users ────────────────────────────────────────────────────
const broadcastToAll = async (notification) => {
  const users = await User.find({
    notificationsEnabled: true,
    'fcmTokens.0': { $exists: true },
  }).select('_id').lean();

  logger.info(`[FCM] Broadcasting to all ${users.length} users`);
  await sendToUsers(users.map((u) => u._id), notification);
};

// ── Register / Update FCM token for a user ───────────────────────────────────
const registerToken = async (userId, token, device = 'android') => {
  // Remove this token from any other user first (device re-use safety)
  await User.updateMany(
    { 'fcmTokens.token': token, _id: { $ne: userId } },
    { $pull: { fcmTokens: { token } } }
  );

  // Upsert the token for this user
  const user = await User.findById(userId);
  if (!user) return;

  const existing = user.fcmTokens.find((t) => t.token === token);
  if (existing) {
    existing.updatedAt = new Date();
  } else {
    // Limit to 5 tokens per user (multiple devices)
    if (user.fcmTokens.length >= 5) {
      user.fcmTokens.shift(); // Remove oldest
    }
    user.fcmTokens.push({ token, device, updatedAt: new Date() });
  }

  await user.save({ validateBeforeSave: false });
  logger.info(`[FCM] Token registered for user ${userId} (${device})`);
};

// ── Remove FCM token (on logout) ──────────────────────────────────────────────
const removeToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { fcmTokens: { token } },
  });
};

// ── Pre-built notification templates ─────────────────────────────────────────
const templates = {
  dailyQuizReady: (examCategory) => ({
    title: '🧠 Daily Quiz is Live!',
    body: `Today's ${examCategory.toUpperCase()} quiz is ready. Attempt now to maintain your streak!`,
    data: { type: 'daily_quiz', examCategory },
  }),

  streakReminder: (streak) => ({
    title: '🔥 Don\'t break your streak!',
    body: `You're on a ${streak}-day streak. Log in today to keep it going!`,
    data: { type: 'streak_reminder' },
  }),

  leaderboardUpdate: (rank) => ({
    title: '🏆 Leaderboard Updated',
    body: `You are currently ranked #${rank} on today's leaderboard. Keep going!`,
    data: { type: 'leaderboard_update', rank: String(rank) },
  }),

  newCurrentAffairs: (count) => ({
    title: '📰 New Current Affairs',
    body: `${count} new current affairs articles are available. Stay updated!`,
    data: { type: 'current_affairs' },
  }),
};

module.exports = {
  sendToToken,
  sendToUser,
  sendToUsers,
  broadcastToCategory,
  broadcastToAll,
  registerToken,
  removeToken,
  templates,
};
