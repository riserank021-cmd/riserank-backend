/**
 * quiz.service.js
 * Quiz CRUD + quiz attempt (submit + score calculation).
 */

const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Question = require('../models/Question');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { CONTENT_STATUS } = require('../config/constants');
const emailService = require('../utils/email.service');

// ── Quiz CRUD ─────────────────────────────────────────────────────────────────

const createQuiz = async (data, adminId) => {
  return Quiz.create({ ...data, createdBy: adminId });
};

const updateQuiz = async (id, data, adminId) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) throw new AppError('Quiz not found', 404);
  Object.assign(quiz, data);
  quiz.updatedBy = adminId;
  await quiz.save();
  return quiz;
};

const deleteQuiz = async (id) => {
  const quiz = await Quiz.findByIdAndDelete(id);
  if (!quiz) throw new AppError('Quiz not found', 404);
};

const getQuizById = async (id) => {
  const quiz = await Quiz.findById(id).populate({
    path: 'questions',
    select: '-correctOption -explanation', // Hide answers when fetching quiz to attempt
  });
  if (!quiz) throw new AppError('Quiz not found', 404);
  return quiz;
};

const listQuizzes = async (query, isAdmin = false) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (!isAdmin) filter.status = CONTENT_STATUS.PUBLISHED;
  else if (query.status) filter.status = query.status;
  if (query.examCategory) filter.examCategory = query.examCategory;
  if (query.isDaily !== undefined) filter.isDaily = query.isDaily === 'true';

  const [items, total] = await Promise.all([
    Quiz.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Quiz.countDocuments(filter),
  ]);
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

// Get today's daily quiz
const getDailyQuiz = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const quiz = await Quiz.findOne({
    isDaily: true,
    status: CONTENT_STATUS.PUBLISHED,
    scheduledDate: { $gte: today, $lt: tomorrow },
  }).populate({
    path: 'questions',
    select: '-correctOption -explanation',
  });

  if (!quiz) throw new AppError("No daily quiz scheduled for today", 404);
  return quiz;
};

// ── Quiz Attempt ──────────────────────────────────────────────────────────────

const startAttempt = async (quizId, userId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.status !== CONTENT_STATUS.PUBLISHED) {
    throw new AppError('Quiz not found or not available', 404);
  }

  // Check for existing incomplete attempt
  const existing = await QuizAttempt.findOne({
    user: userId,
    quiz: quizId,
    isCompleted: false,
  });

  if (existing) return { attempt: existing, isExisting: true };

  const attempt = await QuizAttempt.create({
    user: userId,
    quiz: quizId,
    totalMarks: quiz.totalMarks || quiz.questions.length,
    startedAt: new Date(),
  });

  return { attempt, isExisting: false };
};

const submitAttempt = async (quizId, userId, { answers, timeTakenSeconds, language }) => {
  const quiz = await Quiz.findById(quizId).populate('questions');
  if (!quiz) throw new AppError('Quiz not found', 404);

  const attempt = await QuizAttempt.findOne({
    user: userId,
    quiz: quizId,
    isCompleted: false,
  });

  if (!attempt) throw new AppError('No active attempt found for this quiz', 404);

  // Build a lookup map for correct answers
  const questionMap = {};
  quiz.questions.forEach((q) => {
    questionMap[q._id.toString()] = q.correctOption;
  });

  // Score the answers
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const scoredAnswers = answers.map((a) => {
    const correctOption = questionMap[a.question];
    let isCorrect = false;

    if (!a.selectedOption) {
      skippedCount++;
    } else if (a.selectedOption === correctOption) {
      isCorrect = true;
      correctCount++;
      score += 1;
    } else {
      wrongCount++;
      if (quiz.negativeMarking) {
        score -= quiz.negativeMarkValue;
      }
    }

    return { ...a, isCorrect };
  });

  const totalMarks = quiz.totalMarks || quiz.questions.length;
  const percentage = parseFloat(((score / totalMarks) * 100).toFixed(2));

  // Update attempt
  attempt.answers = scoredAnswers;
  attempt.score = Math.max(0, score);
  attempt.totalMarks = totalMarks;
  attempt.percentage = Math.max(0, percentage);
  attempt.correctCount = correctCount;
  attempt.wrongCount = wrongCount;
  attempt.skippedCount = skippedCount;
  attempt.timeTakenSeconds = timeTakenSeconds;
  attempt.submittedAt = new Date();
  attempt.isCompleted = true;
  attempt.language = language;
  await attempt.save();

  // Send quiz completion email (fire-and-forget — never blocks the response)
  User.findById(userId).select('name email').lean().then((u) => {
    if (u?.email) {
      const quizTitle = typeof quiz.title === 'object' ? (quiz.title.en || '') : (quiz.title || '');
      emailService.sendQuizCompletionEmail(u.email, u.name, quizTitle, {
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        correctCount,
        wrongCount,
        skippedCount,
        attemptId: attempt._id.toString(),
      });
    }
  }).catch(() => {});

  // Update quiz aggregate stats
  Quiz.findByIdAndUpdate(quizId, {
    $inc: { attemptCount: 1 },
  }).exec();

  // Update question attempt counts
  const correctQuestions = scoredAnswers.filter((a) => a.isCorrect).map((a) => a.question);
  const allAttempted = scoredAnswers.map((a) => a.question);

  Question.updateMany(
    { _id: { $in: allAttempted } },
    { $inc: { attemptCount: 1 } }
  ).exec();

  if (correctQuestions.length) {
    Question.updateMany(
      { _id: { $in: correctQuestions } },
      { $inc: { correctCount: 1 } }
    ).exec();
  }

  // Update user stats
  const answeredCount = scoredAnswers.filter((a) => a.selectedOption).length;
  User.findByIdAndUpdate(userId, {
    $inc: {
      totalQuizAttempts: 1,
      totalCorrect: correctCount,
      totalAnswered: answeredCount,
      totalTimeSpentSeconds: timeTakenSeconds || 0,
    },
  }).exec();

  return attempt;
};

const getAttemptById = async (attemptId, userId) => {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId, isCompleted: true })
    .populate('quiz', 'title description examCategory isDaily durationSeconds totalMarks negativeMarking negativeMarkValue')
    .populate('answers.question', 'questionText options correctOption explanation difficulty subject topic')
    .lean();
  if (!attempt) throw new AppError('Attempt not found', 404);

  // Compute All India Rank for this quiz attempt
  const quizId = attempt.quiz?._id ?? attempt.quiz;
  const [rank, totalAttempts] = await Promise.all([
    QuizAttempt.countDocuments({ quiz: quizId, isCompleted: true, score: { $gt: attempt.score } }),
    QuizAttempt.countDocuments({ quiz: quizId, isCompleted: true }),
  ]);
  attempt.rank = rank + 1;
  attempt.totalAttempts = totalAttempts;

  return attempt;
};

const getAttemptHistory = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [items, total] = await Promise.all([
    QuizAttempt.find({ user: userId, isCompleted: true })
      .populate('quiz', 'title examCategory isDaily')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    QuizAttempt.countDocuments({ user: userId, isCompleted: true }),
  ]);

  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

// ── Practice Quiz Generator ───────────────────────────────────────────────────

const { PRACTICE_SUBJECTS } = require('../config/constants');

/**
 * Generate an on-demand practice quiz from the question bank.
 * Creates a real Quiz document so it flows through the normal attempt pipeline.
 *
 * @param {Object} params
 * @param {string} params.examCategory  - e.g. 'ssc'
 * @param {string} params.subject       - e.g. 'english' | 'gk_gs'
 * @param {string} [params.topic]       - e.g. 'history' (null = all topics in subject)
 * @param {number} params.count         - number of questions (1–100)
 * @param {string} params.userId        - user requesting the quiz
 * @returns {{ quizId, attemptId, questionCount }}
 */
const generatePracticeQuiz = async ({ examCategory, subject, topic, count = 20, userId }) => {
  const safeCount = Math.min(Math.max(parseInt(count, 10) || 20, 1), 100);

  // Build question filter
  const filter = {
    examCategory,
    status: CONTENT_STATUS.PUBLISHED,
  };
  if (subject) filter.subject = subject;
  if (topic)   filter.topic   = topic;

  // Pick random questions using $sample aggregation
  const questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: safeCount } },
    { $project: { _id: 1 } },
  ]);

  if (questions.length === 0) {
    throw new AppError(
      'No questions available for the selected topic yet. Please try another topic or check back later.',
      404
    );
  }

  const questionIds = questions.map((q) => q._id);

  // Build a bilingual title
  const subjectMeta = PRACTICE_SUBJECTS[examCategory]?.[subject];
  const topicMeta = subjectMeta?.topics?.find((t) => t.value === topic);

  const titleEn = topicMeta
    ? `${topicMeta.label.en} Practice — ${questionIds.length} Questions`
    : subjectMeta
    ? `${subjectMeta.label.en} Practice — ${questionIds.length} Questions`
    : `${examCategory.toUpperCase()} Practice — ${questionIds.length} Questions`;

  const titleHi = topicMeta
    ? `${topicMeta.label.hi} अभ्यास — ${questionIds.length} प्रश्न`
    : subjectMeta
    ? `${subjectMeta.label.hi} अभ्यास — ${questionIds.length} प्रश्न`
    : `${examCategory.toUpperCase()} अभ्यास — ${questionIds.length} प्रश्न`;

  // Duration: 90 seconds per question (minimum 5 min)
  const durationSeconds = Math.max(questionIds.length * 90, 300);

  // Create the quiz — use userId as createdBy (Mongoose ObjectId ref isn't enforced at DB level)
  const quiz = await Quiz.create({
    title:          { en: titleEn, hi: titleHi },
    description:    { en: '', hi: '' },
    examCategory,
    questions:      questionIds,
    durationSeconds,
    status:         CONTENT_STATUS.PUBLISHED,
    isPractice:     true,
    practiceSubject: subject ?? null,
    practiceTopic:  topic ?? null,
    createdBy:      userId,
  });

  // Start attempt immediately
  const { attempt } = await startAttempt(quiz._id.toString(), userId);

  return { quizId: quiz._id, attemptId: attempt._id, questionCount: questionIds.length };
};

/**
 * Return the practice subjects/topics config for a given exam category.
 */
const getPracticeSubjects = (examCategory) => {
  return PRACTICE_SUBJECTS[examCategory] ?? {};
};

module.exports = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  listQuizzes,
  getDailyQuiz,
  startAttempt,
  submitAttempt,
  getAttemptById,
  getAttemptHistory,
  generatePracticeQuiz,
  getPracticeSubjects,
};
