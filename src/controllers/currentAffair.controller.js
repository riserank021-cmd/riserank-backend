/**
 * currentAffair.controller.js
 */

const caService = require('../services/currentAffair.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendSuccess: sendOk } = require('../utils/apiResponse');

const create = asyncHandler(async (req, res) => {
  const affair = await caService.create(req.body, req.user._id);
  return sendCreated(res, { message: 'Current affair created', data: { affair } });
});

const update = asyncHandler(async (req, res) => {
  const affair = await caService.update(req.params.id, req.body, req.user._id);
  return sendSuccess(res, { message: 'Current affair updated', data: { affair } });
});

const remove = asyncHandler(async (req, res) => {
  await caService.remove(req.params.id);
  return sendSuccess(res, { message: 'Current affair deleted' });
});

const publish = asyncHandler(async (req, res) => {
  const affair = await caService.publish(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Current affair published', data: { affair } });
});

const archive = asyncHandler(async (req, res) => {
  const affair = await caService.archive(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Current affair archived', data: { affair } });
});

const getById = asyncHandler(async (req, res) => {
  const lang = req.query.lang || req.user?.preferredLanguage || 'en';
  const affair = await caService.getById(req.params.id, lang);
  return sendSuccess(res, { data: affair });
});

const list = asyncHandler(async (req, res) => {
  const isAdmin = ['admin', 'superadmin'].includes(req.user?.role);
  console.error('DEBUG_CA_LIST req.query =', JSON.stringify(req.query));
  const result = await caService.list(req.query, isAdmin);
  console.error('DEBUG_CA_LIST result count =', result.items.length, 'total =', result.pagination?.total);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

module.exports = { create, update, remove, publish, archive, getById, list };
