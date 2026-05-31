const questionService = require('../services/question.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const create = asyncHandler(async (req, res) => {
  const question = await questionService.create(req.body, req.user._id);
  return sendCreated(res, { message: 'Question created', data: { question } });
});

const update = asyncHandler(async (req, res) => {
  const question = await questionService.update(req.params.id, req.body, req.user._id);
  return sendSuccess(res, { message: 'Question updated', data: { question } });
});

const remove = asyncHandler(async (req, res) => {
  await questionService.remove(req.params.id);
  return sendSuccess(res, { message: 'Question deleted' });
});

const getById = asyncHandler(async (req, res) => {
  const question = await questionService.getById(req.params.id);
  return sendSuccess(res, { data: { question } });
});

const list = asyncHandler(async (req, res) => {
  const isAdmin = ['admin', 'superadmin'].includes(req.user?.role);
  const result = await questionService.list(req.query, isAdmin);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

module.exports = { create, update, remove, getById, list };
