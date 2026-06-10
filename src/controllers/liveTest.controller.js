/**
 * liveTest.controller.js
 */

const liveTestService = require('../services/liveTest.service');
const catchAsync = require('../utils/asyncHandler');

// GET /live-tests?status=upcoming|live|ended&page=1&limit=20
exports.list = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const result = await liveTestService.getLiveTests({ status, page: +page, limit: +limit });
  res.json({ success: true, data: result.tests, pagination: result.pagination });
});

// GET /live-tests/:id
exports.getOne = catchAsync(async (req, res) => {
  const userId = req.user?._id ?? null;
  const { test, myAttempt } = await liveTestService.getLiveTestById(req.params.id, userId);
  res.json({ success: true, data: { test, myAttempt } });
});

// POST /live-tests/:id/start
exports.start = catchAsync(async (req, res) => {
  const { language } = req.body;
  const result = await liveTestService.startAttempt(req.params.id, req.user._id, language);
  res.json({ success: true, data: result });
});

// POST /live-tests/:id/submit
exports.submit = catchAsync(async (req, res) => {
  const { answers, timeTakenSeconds, language } = req.body;
  const attempt = await liveTestService.submitAttempt(req.params.id, req.user._id, {
    answers,
    timeTakenSeconds,
    language,
  });
  res.json({ success: true, data: attempt });
});

// GET /live-tests/:id/leaderboard
exports.leaderboard = catchAsync(async (req, res) => {
  const { limit = 50 } = req.query;
  const entries = await liveTestService.getLeaderboard(req.params.id, { limit: +limit });
  res.json({ success: true, data: entries });
});

// GET /live-tests/:id/stats
exports.stats = catchAsync(async (req, res) => {
  const data = await liveTestService.getStats(req.params.id);
  res.json({ success: true, data });
});

// POST /live-tests  (admin)
exports.create = catchAsync(async (req, res) => {
  const test = await liveTestService.createLiveTest(req.body, req.user._id);
  res.status(201).json({ success: true, data: test });
});

// PATCH /live-tests/:id  (admin) — update questions / details
exports.update = catchAsync(async (req, res) => {
  const test = await liveTestService.updateLiveTest(req.params.id, req.body);
  res.json({ success: true, data: test });
});

// PATCH /live-tests/:id/status  (admin)
exports.setStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const test = await liveTestService.updateStatus(req.params.id, status);
  res.json({ success: true, data: test });
});
