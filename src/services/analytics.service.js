/**
 * analytics.service.js
 * Queries activity logs + sessions + quiz attempts for the analytics dashboard.
 * Only Super Admin has access.
 */

const Session = require('../models/Session');
const ActivityLog = require('../models/ActivityLog');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Quiz = require('../models/Quiz');

// ── Daily Active Users (DAU) ──────────────────────────────────────────────────
const getDailyActiveUsers = async (days = 7) => {
  const result = await Session.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: '$dateKey',
        uniqueUsers: { $addToSet: '$user' },
      },
    },
    {
      $project: {
        date: '$_id',
        count: { $size: '$uniqueUsers' },
        _id: 0,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return result;
};

// ── Average Session Duration ──────────────────────────────────────────────────
const getAvgSessionDuration = async (days = 7) => {
  const result = await Session.aggregate([
    {
      $match: {
        isActive: false,
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: '$dateKey',
        avgDuration: { $avg: '$durationSeconds' },
        totalSessions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return result;
};

// ── Quiz Stats ────────────────────────────────────────────────────────────────
const getQuizStats = async (days = 7) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalAttempts, mostAttempted] = await Promise.all([
    QuizAttempt.countDocuments({ isCompleted: true, createdAt: { $gte: since } }),
    Quiz.find()
      .sort({ attemptCount: -1 })
      .limit(5)
      .select('title examCategory attemptCount averageScore')
      .lean(),
  ]);

  return { totalAttempts, mostAttempted };
};

// ── Most Active Users ─────────────────────────────────────────────────────────
const getMostActiveUsers = async (limit = 10) => {
  return User.find()
    .sort({ totalQuizAttempts: -1 })
    .limit(limit)
    .select('name email totalQuizAttempts totalCorrect currentStreak lastLoginAt')
    .lean();
};

// ── User Growth ───────────────────────────────────────────────────────────────
const getUserGrowth = async (days = 30) => {
  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return result;
};

// ── Admin Activity Logs ───────────────────────────────────────────────────────
const getAdminActivityLogs = async (query) => {
  const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { actorModel: 'Admin' };
  if (query.adminId) filter.actor = query.adminId;
  if (query.action) filter.action = new RegExp(query.action, 'i');

  const [items, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

// ── Overview Stats ────────────────────────────────────────────────────────────
const getOverviewStats = async () => {
  const [totalUsers, totalQuizzes, totalAttempts, activeToday] = await Promise.all([
    User.countDocuments(),
    Quiz.countDocuments({ status: 'published' }),
    QuizAttempt.countDocuments({ isCompleted: true }),
    Session.countDocuments({
      dateKey: new Date().toISOString().split('T')[0],
    }),
  ]);

  return { totalUsers, totalQuizzes, totalAttempts, activeToday };
};

module.exports = {
  getDailyActiveUsers,
  getAvgSessionDuration,
  getQuizStats,
  getMostActiveUsers,
  getUserGrowth,
  getAdminActivityLogs,
  getOverviewStats,
};
