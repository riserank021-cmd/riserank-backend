const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  return sendCreated(res, { message: 'Category created', data: { category } });
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  return sendSuccess(res, { message: 'Category updated', data: { category } });
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  return sendSuccess(res, { message: 'Category deleted' });
});

// Public — used by frontend/app to populate dropdowns
const getAll = asyncHandler(async (req, res) => {
  // Admins can see inactive categories; users only see active
  const isAdmin = ['admin', 'superadmin'].includes(req.user?.role);
  const categories = await categoryService.getAll(!isAdmin);
  return sendSuccess(res, { data: { categories } });
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  return sendSuccess(res, { data: { category } });
});

module.exports = { create, update, remove, getAll, getById };
