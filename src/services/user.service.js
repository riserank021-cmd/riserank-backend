/**
 * user.service.js
 * Bookmarks, Reports, Leaderboard, User profile management.
 */

const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Report = require('../models/Report');
const Leaderboard = require('../models/Leaderboard');
const QuizAttempt = require('../models/QuizAttempt');
const AppError = require('../utils/AppError');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

// ── Profile ───────────────────────────────────────────────────────────────────

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateProfile = async (userId, data) => {
  const allowedFields = ['name', 'phone', 'preferredLanguage', 'preferredExams', 'state'];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) updateData[field] = data[field];
  });

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────

const addBookmark = async (userId, questionId, note) => {
  try {
    const bookmark = await Bookmark.create({ user: userId, question: questionId, note });
    return bookmark;
  } catch (err) {
    if (err.code === 11000) throw new AppError('Question already bookmarked', 409);
    throw err;
  }
};

const removeBookmark = async (userId, questionId) => {
  const bookmark = await Bookmark.findOneAndDelete({ user: userId, question: questionId });
  if (!bookmark) throw new AppError('Bookmark not found', 404);
};

const getBookmarks = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [items, total] = await Promise.all([
    Bookmark.find({ user: userId })
      .populate({
        path: 'question',
        select: 'questionText examCategory difficulty options correctOption explanation',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Bookmark.countDocuments({ user: userId }),
  ]);

  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

// ── Reports ───────────────────────────────────────────────────────────────────

const reportQuestion = async (userId, questionId, { reason, note }) => {
  // Check for existing pending report from same user
  const existing = await Report.findOne({ user: userId, question: questionId, status: 'pending' });
  if (existing) throw new AppError('You have already reported this question', 409);

  const report = await Report.create({ user: userId, question: questionId, reason, description: note });

  // Increment question report count
  const Question = require('../models/Question');
  Question.findByIdAndUpdate(questionId, { $inc: { reportCount: 1 } }).exec();

  return report;
};

// ── Leaderboard ───────────────────────────────────────────────────────────────

const getLeaderboard = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { periodType = 'daily', examCategory = 'all' } = query;

  // Get the most recent period date for this type
  const latestEntry = await Leaderboard.findOne({ periodType, examCategory }).sort({ periodDate: -1 });

  if (!latestEntry) {
    return { items: [], pagination: buildPaginationMeta({ page, limit, total: 0 }) };
  }

  const filter = {
    periodType,
    periodDate: latestEntry.periodDate,
    examCategory,
  };

  const [items, total] = await Promise.all([
    Leaderboard.find(filter)
      .populate('user', 'name currentStreak state')
      .sort({ score: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Leaderboard.countDocuments(filter),
  ]);

  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

const getUserLeaderboardRank = async (userId, periodType = 'daily', examCategory = 'all') => {
  const latestEntry = await Leaderboard.findOne({ periodType, examCategory }).sort({ periodDate: -1 });
  if (!latestEntry) return null;

  return Leaderboard.findOne({
    user: userId,
    periodType,
    periodDate: latestEntry.periodDate,
    examCategory,
  });
};

// Called after quiz submit to update leaderboard snapshot
const updateLeaderboardEntry = async (userId, examCategory, score) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Daily
  await Leaderboard.findOneAndUpdate(
    { user: userId, periodType: 'daily', periodDate: now, examCategory: 'all' },
    { $inc: { score, totalQuizzes: 1, correctAnswers: score } },
    { upsert: true, new: true }
  );

  // Also for specific exam category
  if (examCategory && examCategory !== 'all') {
    await Leaderboard.findOneAndUpdate(
      { user: userId, periodType: 'daily', periodDate: now, examCategory },
      { $inc: { score, totalQuizzes: 1, correctAnswers: score } },
      { upsert: true, new: true }
    );
  }
};

// ── Category Stats ────────────────────────────────────────────────────────────

/**
 * Returns per-category accuracy for a given user.
 * Aggregates all completed quiz attempts, groups by quiz category,
 * and computes accuracy (correct / total questions answered).
 */
const getCategoryStats = async (userId) => {
  const mongoose = require('mongoose');
  const userObjId = new mongoose.Types.ObjectId(userId);

  const stats = await QuizAttempt.aggregate([
    // Only completed attempts for this user
    { $match: { user: userObjId, isCompleted: true } },

    // Bring in the quiz document
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quiz',
        foreignField: '_id',
        as: 'quizDoc',
      },
    },
    { $unwind: '$quizDoc' },

    // Bring in the category document
    {
      $lookup: {
        from: 'categories',
        localField: 'quizDoc.category',
        foreignField: '_id',
        as: 'categoryDoc',
      },
    },
    { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: false } },

    // Group by category
    {
      $group: {
        _id: '$categoryDoc._id',
        categoryName: { $first: '$categoryDoc.name' },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: '$correctCount' },
        totalQuestions: { $sum: { $size: '$answers' } },
      },
    },

    // Compute accuracy percentage
    {
      $addFields: {
        accuracy: {
          $cond: {
            if: { $gt: ['$totalQuestions', 0] },
            then: {
              $round: [
                { $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] },
                1,
              ],
            },
            else: 0,
          },
        },
      },
    },

    // Clean up output
    {
      $project: {
        _id: 0,
        categoryId: { $toString: '$_id' },
        categoryName: 1,
        totalAttempts: 1,
        totalCorrect: 1,
        totalQuestions: 1,
        accuracy: 1,
      },
    },

    // Most-attempted categories first
    { $sort: { totalAttempts: -1 } },
  ]);

  return stats;
};

module.exports = {
  getProfile,
  updateProfile,
  addBookmark,
  removeBookmark,
  getBookmarks,
  reportQuestion,
  getLeaderboard,
  getUserLeaderboardRank,
  updateLeaderboardEntry,
  getCategoryStats,
};
