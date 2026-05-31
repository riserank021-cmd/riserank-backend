/**
 * category.service.js
 */

const Category = require('../models/Category');
const AppError = require('../utils/AppError');

const create = async (data) => {
  try {
    return await Category.create(data);
  } catch (err) {
    if (err.code === 11000) throw new AppError(`Slug '${data.slug}' already exists`, 409);
    throw err;
  }
};

const update = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const remove = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new AppError('Category not found', 404);
};

const getAll = async (activeOnly = true) => {
  const filter = activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ order: 1, name: 1 }).lean();
};

const getById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const getBySlug = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

module.exports = { create, update, remove, getAll, getById, getBySlug };
