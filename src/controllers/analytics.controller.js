const analyticsService = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const overview = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getOverviewStats();
  return sendSuccess(res, { data: stats });
});

const dailyActiveUsers = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 7;
  const data = await analyticsService.getDailyActiveUsers(days);
  return sendSuccess(res, { data });
});

const sessionDuration = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 7;
  const data = await analyticsService.getAvgSessionDuration(days);
  return sendSuccess(res, { data });
});

const quizStats = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 7;
  const data = await analyticsService.getQuizStats(days);
  return sendSuccess(res, { data });
});

const mostActiveUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const data = await analyticsService.getMostActiveUsers(limit);
  return sendSuccess(res, { data });
});

const userGrowth = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const data = await analyticsService.getUserGrowth(days);
  return sendSuccess(res, { data });
});

const adminActivityLogs = asyncHandler(async (req, res) => {
  const result = await analyticsService.getAdminActivityLogs(req.query);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

module.exports = {
  overview, dailyActiveUsers, sessionDuration,
  quizStats, mostActiveUsers, userGrowth, adminActivityLogs,
};
