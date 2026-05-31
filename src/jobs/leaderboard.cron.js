/**
 * leaderboard.cron.js
 * Cron jobs for leaderboard rank calculation and weekly/all-time snapshots.
 *
 * Schedule:
 *  - Daily rank update   → runs every day at 23:55 (before midnight)
 *  - Weekly snapshot     → runs every Sunday at 23:58
 *  - All-time update     → runs every day at 23:57
 *
 * How it works:
 *  1. Aggregate QuizAttempts for the period
 *  2. Upsert Leaderboard entries with scores + rank number
 */

const cron = require('node-cron');
const QuizAttempt = require('../models/QuizAttempt');
const Leaderboard = require('../models/Leaderboard');
const logger = require('../utils/logger');

// ── Helper: get start of today ────────────────────────────────────────────────
const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ── Helper: get start of current week (Monday) ────────────────────────────────
const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ── Core: compute and upsert leaderboard for a period ────────────────────────
const computeLeaderboard = async (periodType, fromDate, toDate, periodDate) => {
  logger.info(`[Leaderboard] Computing ${periodType} from ${fromDate.toISOString()}`);

  // Aggregate scores from completed quiz attempts
  const scores = await QuizAttempt.aggregate([
    {
      $match: {
        isCompleted: true,
        submittedAt: { $gte: fromDate, $lt: toDate },
      },
    },
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quiz',
        foreignField: '_id',
        as: 'quizData',
      },
    },
    { $unwind: '$quizData' },
    {
      $group: {
        _id: {
          user: '$user',
          examCategory: '$quizData.examCategory',
        },
        score: { $sum: '$score' },
        correctAnswers: { $sum: '$correctCount' },
        totalQuizzes: { $sum: 1 },
      },
    },
    { $sort: { score: -1 } },
  ]);

  if (!scores.length) {
    logger.info(`[Leaderboard] No attempts found for ${periodType} period`);
    return;
  }

  // Also compute "all" category totals
  const allCategoryMap = {};
  for (const entry of scores) {
    const uid = entry._id.user.toString();
    if (!allCategoryMap[uid]) {
      allCategoryMap[uid] = { user: entry._id.user, score: 0, correctAnswers: 0, totalQuizzes: 0 };
    }
    allCategoryMap[uid].score += entry.score;
    allCategoryMap[uid].correctAnswers += entry.correctAnswers;
    allCategoryMap[uid].totalQuizzes += entry.totalQuizzes;
  }

  const allEntries = Object.values(allCategoryMap).sort((a, b) => b.score - a.score);

  // Upsert per-category entries
  const bulkOps = [];
  for (const entry of scores) {
    bulkOps.push({
      updateOne: {
        filter: {
          user: entry._id.user,
          periodType,
          periodDate,
          examCategory: entry._id.examCategory,
        },
        update: {
          $set: {
            score: entry.score,
            correctAnswers: entry.correctAnswers,
            totalQuizzes: entry.totalQuizzes,
          },
        },
        upsert: true,
      },
    });
  }

  // Upsert "all" category entries with ranks
  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    bulkOps.push({
      updateOne: {
        filter: {
          user: entry.user,
          periodType,
          periodDate,
          examCategory: 'all',
        },
        update: {
          $set: {
            score: entry.score,
            correctAnswers: entry.correctAnswers,
            totalQuizzes: entry.totalQuizzes,
            rank: i + 1,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulkOps.length) {
    await Leaderboard.bulkWrite(bulkOps);
  }

  logger.info(`[Leaderboard] ${periodType} updated — ${allEntries.length} users ranked`);
};

// ── Job: Daily leaderboard (runs 23:55 every day) ────────────────────────────
const scheduleDailyLeaderboard = () => {
  cron.schedule('55 23 * * *', async () => {
    try {
      const today = startOfDay();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      await computeLeaderboard('daily', today, tomorrow, today);
    } catch (err) {
      logger.error(`[Leaderboard] Daily job failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('[Leaderboard] Daily cron scheduled (23:55 IST)');
};

// ── Job: Weekly leaderboard (runs Sunday 23:58) ───────────────────────────────
const scheduleWeeklyLeaderboard = () => {
  cron.schedule('58 23 * * 0', async () => {
    try {
      const weekStart = startOfWeek();
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      await computeLeaderboard('weekly', weekStart, weekEnd, weekStart);
    } catch (err) {
      logger.error(`[Leaderboard] Weekly job failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('[Leaderboard] Weekly cron scheduled (Sun 23:58 IST)');
};

// ── Job: All-time leaderboard (runs 23:57 every day) ─────────────────────────
const scheduleAllTimeLeaderboard = () => {
  cron.schedule('57 23 * * *', async () => {
    try {
      const epoch = new Date('2024-01-01T00:00:00.000Z');
      const now = new Date();
      await computeLeaderboard('alltime', epoch, now, epoch);
    } catch (err) {
      logger.error(`[Leaderboard] All-time job failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('[Leaderboard] All-time cron scheduled (23:57 IST)');
};

module.exports = {
  scheduleDailyLeaderboard,
  scheduleWeeklyLeaderboard,
  scheduleAllTimeLeaderboard,
};
