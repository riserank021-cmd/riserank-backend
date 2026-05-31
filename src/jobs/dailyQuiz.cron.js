/**
 * dailyQuiz.cron.js
 *
 * Two jobs:
 *
 * 1. checkDailyQuiz (00:01 IST)
 *    Verifies a daily quiz exists for today. Logs warning if missing.
 *
 * 2. sendDailyQuizNotification (08:00 IST)
 *    Finds today's daily quiz → sends FCM push to users whose preferredExams
 *    includes that quiz's examCategory. Also sends to users with no preference
 *    (they get all notifications).
 */

const cron = require('node-cron');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const { CONTENT_STATUS } = require('../config/constants');

// ── Shared helper ─────────────────────────────────────────────────────────────
const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

const getTodayQuiz = async () => {
  const { today, tomorrow } = getTodayRange();
  return Quiz.findOne({
    isDaily: true,
    status: CONTENT_STATUS.PUBLISHED,
    scheduledDate: { $gte: today, $lt: tomorrow },
  });
};

// ── Job 1: Existence check at midnight ───────────────────────────────────────
const checkDailyQuiz = async () => {
  const quiz = await getTodayQuiz();
  if (!quiz) {
    logger.warn(`[DailyQuiz] ⚠️  No daily quiz scheduled for today. Admin action required.`);
  } else {
    logger.info(`[DailyQuiz] ✅ Daily quiz ready: "${quiz.title?.en}" (${quiz._id})`);
  }
  return quiz;
};

// ── Job 2: FCM broadcast at 08:00 ────────────────────────────────────────────
const sendDailyQuizNotification = async () => {
  const quiz = await getTodayQuiz();

  if (!quiz) {
    logger.warn('[DailyQuiz] Notification skipped — no quiz scheduled for today');
    return;
  }

  const examCategory = quiz.examCategory;
  logger.info(`[DailyQuiz] Broadcasting notification for quiz: ${quiz.title?.en} (${examCategory})`);

  // Users who explicitly prefer this exam category
  const targetUsers = await User.find({
    $or: [
      { preferredExams: examCategory },
      { preferredExams: { $size: 0 } }, // Users with no preference get all
    ],
    notificationsEnabled: true,
    'fcmTokens.0': { $exists: true },
    isActive: true,
    isSuspended: false,
  })
    .select('_id')
    .lean();

  if (!targetUsers.length) {
    logger.info('[DailyQuiz] No eligible users to notify');
    return;
  }

  const notification = notificationService.templates.dailyQuizReady(examCategory);

  // Send in batches of 50
  const BATCH_SIZE = 50;
  const userIds = targetUsers.map((u) => u._id);
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    await notificationService.sendToUsers(userIds.slice(i, i + BATCH_SIZE), notification);
  }

  logger.info(`[DailyQuiz] Notification sent to ${userIds.length} users ✅`);
};

// ── Schedule both jobs ────────────────────────────────────────────────────────
const scheduleDailyQuizCheck = () => {
  // Job 1: midnight check (00:01 IST)
  cron.schedule('1 0 * * *', async () => {
    try {
      await checkDailyQuiz();
    } catch (err) {
      logger.error(`[DailyQuiz] Midnight check failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Kolkata' });

  // Job 2: morning notification (08:00 IST)
  cron.schedule('0 8 * * *', async () => {
    try {
      await sendDailyQuizNotification();
    } catch (err) {
      logger.error(`[DailyQuiz] Morning notification failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('[DailyQuiz] Check cron scheduled (00:01 IST) + Notification cron (08:00 IST)');
};

module.exports = { scheduleDailyQuizCheck, checkDailyQuiz, sendDailyQuizNotification };
