/**
 * liveTest.service.js
 * Business logic for live tests.
 */

const LiveTest = require('../models/LiveTest');
const LiveTestAttempt = require('../models/LiveTestAttempt');
const Question = require('../models/Question');
const AppError = require('../utils/AppError');

// ── List live tests ───────────────────────────────────────────────────────────

const getLiveTests = async ({ status, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [tests, total] = await Promise.all([
    LiveTest.find(filter)
      .sort({ scheduledAt: status === 'ended' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select('-questions')   // don't leak questions before test starts
      .lean(),
    LiveTest.countDocuments(filter),
  ]);

  return {
    tests,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// ── Get single live test ──────────────────────────────────────────────────────

const getLiveTestById = async (testId, userId) => {
  const test = await LiveTest.findById(testId).lean();
  if (!test) throw new AppError('Live test not found', 404);

  // Only expose questions when the test is live or ended
  if (test.status === 'upcoming') {
    delete test.questions;
  } else {
    await LiveTest.populate(test, {
      path: 'questions',
      select: 'questionText options correctOption explanation difficulty',
    });
  }

  // Check if this user already has an attempt
  let myAttempt = null;
  if (userId) {
    myAttempt = await LiveTestAttempt.findOne({ liveTest: testId, user: userId })
      .select('isCompleted score percentage correctCount wrongCount skippedCount rank timeTakenSeconds startedAt')
      .lean();
  }

  return { test, myAttempt };
};

// ── Start attempt ─────────────────────────────────────────────────────────────

const startAttempt = async (testId, userId, language = 'en') => {
  const test = await LiveTest.findById(testId).lean();
  if (!test) throw new AppError('Live test not found', 404);
  if (test.status !== 'live') throw new AppError('This test is not currently live', 400);

  // Upsert — idempotent so users can rejoin if they restart the app
  const attempt = await LiveTestAttempt.findOneAndUpdate(
    { liveTest: testId, user: userId },
    { $setOnInsert: { liveTest: testId, user: userId, language, startedAt: new Date() } },
    { upsert: true, new: true }
  );

  // Populate questions (with correct answers hidden during attempt)
  const questions = await Question.find({ _id: { $in: test.questions } })
    .select('questionText options correctOption explanation difficulty subject topic')
    .lean();

  return { attempt, test, questions };
};

// ── Submit attempt ────────────────────────────────────────────────────────────

const submitAttempt = async (testId, userId, { answers, timeTakenSeconds, language }) => {
  const test = await LiveTest.findById(testId).lean();
  if (!test) throw new AppError('Live test not found', 404);

  // Allow submission during live or up to 5 min after ended
  const now = new Date();
  const endAt = new Date(test.scheduledAt.getTime() + test.durationSeconds * 1000);
  const graceEndAt = new Date(endAt.getTime() + 5 * 60 * 1000);
  if (test.status === 'upcoming') throw new AppError('Test has not started yet', 400);
  if (now > graceEndAt) throw new AppError('Submission window has closed', 400);

  const existingAttempt = await LiveTestAttempt.findOne({ liveTest: testId, user: userId });
  if (existingAttempt?.isCompleted) throw new AppError('You have already submitted this test', 400);

  // Fetch questions to grade
  const questions = await Question.find({ _id: { $in: test.questions } })
    .select('correctOption')
    .lean();

  const questionMap = Object.fromEntries(questions.map((q) => [q._id.toString(), q]));

  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  const marksPerQuestion = test.totalMarks ? test.totalMarks / test.questions.length : 1;

  const gradedAnswers = answers.map(({ question, selectedOption }) => {
    const q = questionMap[question.toString()];
    if (!q) return { question, selectedOption: null, isCorrect: false };

    if (!selectedOption) {
      skippedCount++;
      return { question, selectedOption: null, isCorrect: false };
    }

    const isCorrect = selectedOption === q.correctOption;
    if (isCorrect) {
      correctCount++;
      score += marksPerQuestion;
    } else {
      wrongCount++;
      if (test.negativeMarking) score -= marksPerQuestion * test.negativeMarkValue;
    }
    return { question, selectedOption, isCorrect };
  });

  score = Math.max(0, Math.round(score * 100) / 100);
  const totalQ = test.questions.length;
  const percentage = totalQ > 0 ? Math.round((correctCount / totalQ) * 100 * 10) / 10 : 0;

  // Compute rank (how many completed attempts have a higher score)
  const higherScoreCount = await LiveTestAttempt.countDocuments({
    liveTest: testId,
    isCompleted: true,
    score: { $gt: score },
  });
  const rank = higherScoreCount + 1;

  const updatedAttempt = await LiveTestAttempt.findOneAndUpdate(
    { liveTest: testId, user: userId },
    {
      $set: {
        answers: gradedAnswers,
        score,
        correctCount,
        wrongCount,
        skippedCount,
        percentage,
        timeTakenSeconds,
        isCompleted: true,
        rank,
        language,
        submittedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  // Increment participant count
  await LiveTest.findByIdAndUpdate(testId, { $inc: { participantCount: 1 } });

  return updatedAttempt;
};

// ── Get leaderboard ───────────────────────────────────────────────────────────

const getLeaderboard = async (testId, { limit = 20 } = {}) => {
  const entries = await LiveTestAttempt.find({ liveTest: testId, isCompleted: true })
    .sort({ score: -1, timeTakenSeconds: 1 })
    .limit(limit)
    .populate('user', 'name avatar')
    .select('user score percentage correctCount timeTakenSeconds rank')
    .lean();

  return entries.map((e, i) => ({
    rank: i + 1,
    userId: e.user?._id,
    name: e.user?.name ?? 'Unknown',
    avatar: e.user?.avatar ?? null,
    score: e.score,
    percentage: e.percentage,
    correctCount: e.correctCount,
    timeTakenSeconds: e.timeTakenSeconds,
  }));
};

// ── Get live stats (participant count) ────────────────────────────────────────

const getStats = async (testId) => {
  const [test, participantCount, submittedCount] = await Promise.all([
    LiveTest.findById(testId).select('participantCount registeredCount status').lean(),
    LiveTestAttempt.countDocuments({ liveTest: testId }),
    LiveTestAttempt.countDocuments({ liveTest: testId, isCompleted: true }),
  ]);
  if (!test) throw new AppError('Live test not found', 404);
  return { participantCount: participantCount, submittedCount, status: test.status };
};

// ── Admin: Create live test ───────────────────────────────────────────────────

const createLiveTest = async (data, createdBy) => {
  const test = await LiveTest.create({ ...data, createdBy });
  return test;
};

// ── Admin: Update live test (questions, title, schedule, etc.) ───────────────

const updateLiveTest = async (testId, data) => {
  const allowed = ['title', 'description', 'examCategory', 'questions', 'scheduledAt',
                   'durationSeconds', 'totalMarks', 'negativeMarking', 'negativeMarkValue'];
  const update = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  const test = await LiveTest.findByIdAndUpdate(testId, { $set: update }, { new: true, runValidators: true });
  if (!test) throw new AppError('Live test not found', 404);
  return test;
};

// ── Admin: Update status manually ────────────────────────────────────────────

const updateStatus = async (testId, status) => {
  const test = await LiveTest.findByIdAndUpdate(testId, { status }, { new: true });
  if (!test) throw new AppError('Live test not found', 404);
  return test;
};

// ── Auto-transition statuses (called by cron) ─────────────────────────────────

const autoTransitionStatuses = async () => {
  const now = new Date();

  // upcoming → live: scheduledAt <= now
  await LiveTest.updateMany(
    { status: 'upcoming', scheduledAt: { $lte: now } },
    { $set: { status: 'live' } }
  );

  // live → ended: scheduledAt + durationSeconds <= now
  // Use aggregation pipeline to compare scheduledAt + durationSeconds vs now
  const livTests = await LiveTest.find({ status: 'live' }).select('scheduledAt durationSeconds').lean();
  const toEnd = livTests.filter((t) => {
    const endAt = new Date(t.scheduledAt.getTime() + t.durationSeconds * 1000);
    return endAt <= now;
  });

  if (toEnd.length) {
    await LiveTest.updateMany(
      { _id: { $in: toEnd.map((t) => t._id) } },
      { $set: { status: 'ended' } }
    );
  }
};

module.exports = {
  getLiveTests,
  getLiveTestById,
  startAttempt,
  submitAttempt,
  getLeaderboard,
  getStats,
  createLiveTest,
  updateLiveTest,
  updateStatus,
  autoTransitionStatuses,
};
