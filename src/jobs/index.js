/**
 * jobs/index.js
 * Registers and starts all cron jobs.
 * Called once from server.js after DB connection is established.
 *
 * Cron schedule summary (all IST / Asia/Kolkata):
 *  00:01  — Daily quiz existence check
 *  08:00  — Daily quiz FCM notification to users
 *  20:00  — Streak reminder to at-risk users
 *  23:55  — Daily leaderboard rank computation
 *  23:57  — All-time leaderboard update
 *  23:58  — Weekly leaderboard (Sundays only)
 *  * * * * — Live test status transitions (every minute)
 */

const {
  scheduleDailyLeaderboard,
  scheduleWeeklyLeaderboard,
  scheduleAllTimeLeaderboard,
} = require('./leaderboard.cron');
const { scheduleDailyQuizCheck } = require('./dailyQuiz.cron');
const { scheduleStreakReminder } = require('./streakReminder.cron');
const { scheduleLiveTestTransitions } = require('./liveTest.cron');
const logger = require('../utils/logger');

const initJobs = () => {
  logger.info('Initializing background cron jobs...');

  scheduleDailyQuizCheck();       // 00:01 + 08:00 IST
  scheduleStreakReminder();        // 20:00 IST
  scheduleDailyLeaderboard();     // 23:55 IST
  scheduleAllTimeLeaderboard();   // 23:57 IST
  scheduleWeeklyLeaderboard();    // 23:58 IST (Sundays)
  scheduleLiveTestTransitions();  // every minute

  logger.info('All cron jobs registered ✅');
};

module.exports = initJobs;
