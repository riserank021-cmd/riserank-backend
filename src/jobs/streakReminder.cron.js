/**
 * streakReminder.cron.js
 * Runs every day at 20:00 IST.
 *
 * Logic:
 *  1. Find users whose lastActiveDate was yesterday (i.e. they logged in
 *     yesterday but NOT today yet) AND currentStreak > 0
 *  2. Send an FCM push reminder: "Don't break your streak!"
 *
 * Why 20:00? Gives users 4 hours to log in before midnight.
 * We don't bother users who already logged in today (lastActiveDate = today).
 */

const cron = require('node-cron');
const User = require('../models/User');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const sendStreakReminders = async () => {
  const today = startOfDay();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBeforeYesterday = new Date(yesterday);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

  logger.info('[StreakReminder] Finding users to remind...');

  // Users whose lastActiveDate is yesterday (not today — they haven't logged in yet)
  const users = await User.find({
    currentStreak: { $gt: 0 },
    lastActiveDate: { $gte: yesterday, $lt: today },
    notificationsEnabled: true,
    'fcmTokens.0': { $exists: true },
    isSuspended: false,
    isActive: true,
  })
    .select('_id currentStreak')
    .lean();

  if (!users.length) {
    logger.info('[StreakReminder] No users to remind today');
    return;
  }

  logger.info(`[StreakReminder] Sending reminders to ${users.length} users`);

  // Send in batches of 50 to avoid memory spikes
  const BATCH_SIZE = 50;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map((user) =>
        notificationService.sendToUser(
          user._id,
          notificationService.templates.streakReminder(user.currentStreak)
        )
      )
    );
  }

  logger.info(`[StreakReminder] Reminders sent to ${users.length} users ✅`);
};

const scheduleStreakReminder = () => {
  // Every day at 20:00 IST
  cron.schedule('0 20 * * *', async () => {
    try {
      await sendStreakReminders();
    } catch (err) {
      logger.error(`[StreakReminder] Job failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('[StreakReminder] Cron scheduled (20:00 IST daily)');
};

module.exports = { scheduleStreakReminder, sendStreakReminders };
