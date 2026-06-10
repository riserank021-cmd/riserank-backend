/**
 * public.routes.js
 * Unauthenticated endpoints for the marketing website.
 * No auth required — keep responses minimal and non-sensitive.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const CurrentAffair = require('../models/CurrentAffair');
const { CONTENT_STATUS } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

// ── GET /public/stats ─────────────────────────────────────────────────────────
// Real platform counts for the website stats banner.
router.get('/stats', asyncHandler(async (_req, res) => {
  const [totalUsers, totalQuestions, totalQuizzes, totalAttempts] = await Promise.allSettled([
    User.countDocuments({ isActive: true }),
    Question.countDocuments({ status: CONTENT_STATUS.PUBLISHED }),
    Quiz.countDocuments({ status: CONTENT_STATUS.PUBLISHED, isPractice: { $ne: true } }),
    Quiz.aggregate([{ $group: { _id: null, total: { $sum: '$attemptCount' } } }]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers:     totalUsers.status     === 'fulfilled' ? totalUsers.value     : 0,
      totalQuestions: totalQuestions.status === 'fulfilled' ? totalQuestions.value : 0,
      totalQuizzes:   totalQuizzes.status   === 'fulfilled' ? totalQuizzes.value   : 0,
      totalAttempts:  totalAttempts.status  === 'fulfilled'
        ? (totalAttempts.value?.[0]?.total ?? 0)
        : 0,
    },
  });
}));

// ── GET /public/current-affairs ───────────────────────────────────────────────
// Latest published current affairs for the website carousel.
router.get('/current-affairs', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 6, 12);
  const affairs = await CurrentAffair.find({ status: CONTENT_STATUS.PUBLISHED })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .select('title summary category publishedAt createdAt')
    .lean();

  res.json({ success: true, data: affairs });
}));

// ── GET /public/demo-quiz ─────────────────────────────────────────────────────
// 3 random published questions with answers for the website quiz demo.
router.get('/demo-quiz', asyncHandler(async (_req, res) => {
  const questions = await Question.aggregate([
    { $match: { status: CONTENT_STATUS.PUBLISHED } },
    { $sample: { size: 3 } },
    { $project: {
      _id: 0,
      q:           '$questionText.en',
      options:     { $map: { input: '$options', as: 'o', in: '$$o.text.en' } },
      correct:     {
        $indexOfArray: [['A','B','C','D'], '$correctOption']
      },
      explanation: '$explanation.en',
    }},
  ]);

  // Fallback if DB is empty
  if (!questions.length) {
    return res.json({
      success: true,
      data: [
        {
          q: 'The term "NIFTY" is associated with which of the following?',
          options: ['National Stock Exchange (NSE)', 'Bombay Stock Exchange (BSE)', 'Reserve Bank of India (RBI)', 'SEBI'],
          correct: 0,
          explanation: 'NIFTY stands for National Index Fifty. It is the flagship index of the National Stock Exchange (NSE) of India.',
        },
        {
          q: 'Which city is known as the "Pink City" of India?',
          options: ['Jodhpur', 'Jaipur', 'Udaipur', 'Ajmer'],
          correct: 1,
          explanation: 'Jaipur, the capital of Rajasthan, is called the Pink City. It was painted pink in 1876 to welcome Prince Albert of Wales.',
        },
        {
          q: 'The Indian Constitution was adopted on which date?',
          options: ['26 January 1950', '15 August 1947', '26 November 1949', '2 October 1948'],
          correct: 2,
          explanation: 'The Constitution of India was adopted on 26 November 1949 — observed as Constitution Day. It came into force on 26 January 1950.',
        },
      ],
    });
  }

  res.json({ success: true, data: questions });
}));

module.exports = router;
