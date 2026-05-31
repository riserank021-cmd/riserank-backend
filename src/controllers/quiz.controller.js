const quizService = require('../services/quiz.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const create = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.body, req.user._id);
  return sendCreated(res, { message: 'Quiz created', data: { quiz } });
});

const update = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.id, req.body, req.user._id);
  return sendSuccess(res, { message: 'Quiz updated', data: { quiz } });
});

const remove = asyncHandler(async (req, res) => {
  await quizService.deleteQuiz(req.params.id);
  return sendSuccess(res, { message: 'Quiz deleted' });
});

const getById = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizById(req.params.id);
  return sendSuccess(res, { data: quiz });
});

const list = asyncHandler(async (req, res) => {
  const isAdmin = ['admin', 'superadmin'].includes(req.user?.role);
  const result = await quizService.listQuizzes(req.query, isAdmin);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

const getDaily = asyncHandler(async (req, res) => {
  const quiz = await quizService.getDailyQuiz();
  return sendSuccess(res, { data: quiz });
});

const startAttempt = asyncHandler(async (req, res) => {
  const result = await quizService.startAttempt(req.params.id, req.user._id);
  return sendSuccess(res, {
    data: {
      attemptId: result.attempt._id,
      isExisting: result.isExisting,
    },
  });
});

const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await quizService.submitAttempt(req.params.id, req.user._id, req.body);
  return sendSuccess(res, { message: 'Quiz submitted', data: attempt });
});

const getAttemptHistory = asyncHandler(async (req, res) => {
  const result = await quizService.getAttemptHistory(req.user._id, req.query);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

const getAttemptById = asyncHandler(async (req, res) => {
  const attempt = await quizService.getAttemptById(req.params.attemptId, req.user._id);
  return sendSuccess(res, { data: attempt });
});

module.exports = { create, update, remove, getById, list, getDaily, startAttempt, submitAttempt, getAttemptById, getAttemptHistory };
