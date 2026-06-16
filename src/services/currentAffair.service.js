/**
 * currentAffair.service.js
 */

const CurrentAffair = require('../models/CurrentAffair');
const AppError = require('../utils/AppError');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { CONTENT_STATUS } = require('../config/constants');

const create = async (data, adminId) => {
  const affair = await CurrentAffair.create({
    ...data,
    createdBy: adminId,
  });
  return affair;
};

const update = async (id, data, adminId) => {
  const affair = await CurrentAffair.findById(id);
  if (!affair) throw new AppError('Current affair not found', 404);

  Object.assign(affair, data);
  affair.updatedBy = adminId;
  await affair.save();
  return affair;
};

const remove = async (id) => {
  const affair = await CurrentAffair.findByIdAndDelete(id);
  if (!affair) throw new AppError('Current affair not found', 404);
};

const publish = async (id, adminId) => {
  const affair = await CurrentAffair.findById(id);
  if (!affair) throw new AppError('Current affair not found', 404);
  if (affair.status === CONTENT_STATUS.PUBLISHED) {
    throw new AppError('Already published', 400);
  }

  affair.status = CONTENT_STATUS.PUBLISHED;
  affair.publishedAt = new Date();
  affair.updatedBy = adminId;
  await affair.save();
  return affair;
};

const archive = async (id, adminId) => {
  const affair = await CurrentAffair.findById(id);
  if (!affair) throw new AppError('Current affair not found', 404);

  affair.status = CONTENT_STATUS.ARCHIVED;
  affair.archivedAt = new Date();
  affair.updatedBy = adminId;
  await affair.save();
  return affair;
};

const getById = async (id, lang = 'en') => {
  const affair = await CurrentAffair.findById(id)
    .populate('category', 'name slug')
    .populate('createdBy', 'name email');

  if (!affair) throw new AppError('Current affair not found', 404);

  // Increment view count asynchronously
  CurrentAffair.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

  return affair;
};

const list = async (query, isAdmin = false) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {};

  // Non-admins can only see published content
  if (!isAdmin) {
    filter.status = CONTENT_STATUS.PUBLISHED;
  } else if (query.status) {
    filter.status = query.status;
  }

  if (query.examTag) filter.examTags = query.examTag;
  if (query.category) filter.category = query.category;
  // tag filter — case-insensitive match (app sends capitalised tags like 'Economy')
  if (query.tag) filter.tags = { $regex: new RegExp('^' + query.tag + '$', 'i') };

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const [items, total] = await Promise.all([
    CurrentAffair.find(filter)
      .populate('category', 'name slug')
      .populate('createdBy', 'name')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CurrentAffair.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPaginationMeta({ page, limit, total }),
  };
};

module.exports = { create, update, remove, publish, archive, getById, list };
