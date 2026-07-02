/**
 * question.service.js
 */

const Question = require('../models/Question');
const QuestionFeedback = require('../models/QuestionFeedback');
const AppError = require('../utils/AppError');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { CONTENT_STATUS } = require('../config/constants');

const create = async (data, adminId) => {
  return Question.create({ ...data, createdBy: adminId });
};

const update = async (id, data, adminId) => {
  const question = await Question.findById(id);
  if (!question) throw new AppError('Question not found', 404);

  Object.assign(question, data);
  question.updatedBy = adminId;
  await question.save();
  return question;
};

const remove = async (id) => {
  const question = await Question.findByIdAndDelete(id);
  if (!question) throw new AppError('Question not found', 404);
};

const getById = async (id) => {
  const question = await Question.findById(id).populate('createdBy', 'name');
  if (!question) throw new AppError('Question not found', 404);
  return question;
};

const list = async (query, isAdmin = false) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {};
  if (!isAdmin) filter.status = CONTENT_STATUS.PUBLISHED;
  else if (query.status) filter.status = query.status;

  if (query.examCategory) filter.examCategory = query.examCategory;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.subject) filter.subject = new RegExp(query.subject, 'i');
  if (query.search) filter.$text = { $search: query.search };

  const [items, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Question.countDocuments(filter),
  ]);

  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

// Get random questions for a quiz (used when creating auto-generated quizzes)
const getRandom = async ({ examCategory, difficulty, count = 10 }) => {
  const filter = { status: CONTENT_STATUS.PUBLISHED, examCategory };
  if (difficulty) filter.difficulty = difficulty;

  return Question.aggregate([
    { $match: filter },
    { $sample: { size: count } },
  ]);
};

// "Was this helpful?" thumbs up/down on a question's explanation — one vote per user, upserted
const submitFeedback = async (questionId, userId, isHelpful) => {
  const question = await Question.findById(questionId).select('_id');
  if (!question) throw new AppError('Question not found', 404);

  const feedback = await QuestionFeedback.findOneAndUpdate(
    { user: userId, question: questionId },
    { isHelpful },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return feedback;
};

// Batch-fetch the current user's votes for a set of questions (e.g. all questions in a quiz review)
const getFeedbackMap = async (questionIds, userId) => {
  const docs = await QuestionFeedback.find({ user: userId, question: { $in: questionIds } })
    .select('question isHelpful')
    .lean();
  const map = {};
  docs.forEach((d) => {
    map[String(d.question)] = d.isHelpful;
  });
  return map;
};

module.exports = { create, update, remove, getById, list, getRandom, submitFeedback, getFeedbackMap };
