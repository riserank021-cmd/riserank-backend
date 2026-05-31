const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ── Profile ───────────────────────────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  return sendSuccess(res, { data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, { message: 'Profile updated', data: user });
});

// ── Bookmarks ─────────────────────────────────────────────────────────────────
const addBookmark = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { note } = req.body;
  const bookmark = await userService.addBookmark(req.user._id, questionId, note);
  return sendCreated(res, { message: 'Bookmarked', data: { bookmark } });
});

const removeBookmark = asyncHandler(async (req, res) => {
  await userService.removeBookmark(req.user._id, req.params.questionId);
  return sendSuccess(res, { message: 'Bookmark removed' });
});

const getBookmarks = asyncHandler(async (req, res) => {
  const result = await userService.getBookmarks(req.user._id, req.query);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

// ── Reports ───────────────────────────────────────────────────────────────────
const reportQuestion = asyncHandler(async (req, res) => {
  const report = await userService.reportQuestion(
    req.user._id,
    req.params.questionId,
    req.body
  );
  return sendCreated(res, { message: 'Question reported. Thank you for your feedback.', data: { report } });
});

// ── Category Stats ────────────────────────────────────────────────────────────
const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await userService.getCategoryStats(req.user._id);
  return sendSuccess(res, { data: { stats } });
});

// ── Leaderboard ───────────────────────────────────────────────────────────────
const getLeaderboard = asyncHandler(async (req, res) => {
  const result = await userService.getLeaderboard(req.query);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

const getMyRank = asyncHandler(async (req, res) => {
  const { periodType = 'daily', examCategory = 'all' } = req.query;
  const rank = await userService.getUserLeaderboardRank(req.user._id, periodType, examCategory);
  return sendSuccess(res, { data: { rank } });
});

module.exports = {
  getProfile, updateProfile,
  addBookmark, removeBookmark, getBookmarks,
  reportQuestion,
  getCategoryStats,
  getLeaderboard, getMyRank,
};
