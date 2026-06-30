/**
 * tests/services/quizScoring.test.js
 * Unit tests for quiz scoring logic inside quiz.service.js.
 * All Mongoose model calls are mocked so no DB connection is needed.
 */

// ── env.js must be mocked FIRST — it throws at load time if MONGO_URI is absent
jest.mock('../../src/config/env', () => ({
  NODE_ENV: 'test',
  isProduction: false,
  isDevelopment: false,
  MONGO_URI: 'mongodb://localhost/test',
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: '30d',
  BCRYPT_SALT_ROUNDS: 10,
  ALLOWED_ORIGINS: ['http://localhost:3000'],
}));

// ── bcryptjs must be mocked FIRST so Jest never loads the real dist bundle ────
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
  hashSync: jest.fn().mockReturnValue('hashed'),
  compareSync: jest.fn().mockReturnValue(false),
}));

// ── Mock all DB-touching modules before requiring the service ─────────────────
jest.mock('../../src/models/Quiz');
jest.mock('../../src/models/QuizAttempt');
jest.mock('../../src/models/Question');
jest.mock('../../src/models/User');
jest.mock('../../src/utils/pagination', () => ({
  getPaginationParams: jest.fn(() => ({ page: 1, limit: 20, skip: 0 })),
  buildPaginationMeta: jest.fn(() => ({})),
}));

const Quiz = require('../../src/models/Quiz');
const QuizAttempt = require('../../src/models/QuizAttempt');
const Question = require('../../src/models/Question');
const User = require('../../src/models/User');
const { submitAttempt } = require('../../src/services/quiz.service');

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFakeQuiz({ negativeMarking = false, negativeMarkValue = 0.25 } = {}) {
  return {
    _id: 'quiz1',
    questions: [
      { _id: 'q1', correctOption: 'A' },
      { _id: 'q2', correctOption: 'B' },
      { _id: 'q3', correctOption: 'C' },
      { _id: 'q4', correctOption: 'D' },
    ],
    totalMarks: 4,
    negativeMarking,
    negativeMarkValue,
    attemptCount: 0,
  };
}

function buildFakeAttempt() {
  return {
    _id: 'attempt1',
    answers: [],
    isCompleted: false,
    save: jest.fn().mockResolvedValue(true),
  };
}

describe('quiz.service — submitAttempt scoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const execMock = jest.fn().mockResolvedValue(null);
    Quiz.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: execMock });
    Question.updateMany = jest.fn().mockReturnValue({ exec: execMock });
    User.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: execMock });
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });
  });

  it('scores all-correct answers: 4/4 = 100%', async () => {
    const quiz = buildFakeQuiz();
    const attempt = buildFakeAttempt();

    Quiz.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(quiz),
    });
    QuizAttempt.findOne = jest.fn().mockResolvedValue(attempt);

    const answers = [
      { question: 'q1', selectedOption: 'A' },
      { question: 'q2', selectedOption: 'B' },
      { question: 'q3', selectedOption: 'C' },
      { question: 'q4', selectedOption: 'D' },
    ];

    await submitAttempt('quiz1', 'user1', { answers, timeTakenSeconds: 120, language: 'en' });

    expect(attempt.score).toBe(4);
    expect(attempt.correctCount).toBe(4);
    expect(attempt.wrongCount).toBe(0);
    expect(attempt.percentage).toBe(100);
    expect(attempt.isCompleted).toBe(true);
  });

  it('scores all-wrong answers: 0/4 = 0% (no negative marking)', async () => {
    const quiz = buildFakeQuiz({ negativeMarking: false });
    const attempt = buildFakeAttempt();

    Quiz.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(quiz),
    });
    QuizAttempt.findOne = jest.fn().mockResolvedValue(attempt);

    const answers = [
      { question: 'q1', selectedOption: 'B' },
      { question: 'q2', selectedOption: 'A' },
      { question: 'q3', selectedOption: 'A' },
      { question: 'q4', selectedOption: 'A' },
    ];

    await submitAttempt('quiz1', 'user1', { answers, timeTakenSeconds: 60, language: 'en' });

    expect(attempt.score).toBe(0);
    expect(attempt.wrongCount).toBe(4);
    expect(attempt.correctCount).toBe(0);
    expect(attempt.percentage).toBe(0);
  });

  it('applies negative marking: 2 correct, 2 wrong = 2 - 2×0.25 = 1.5', async () => {
    const quiz = buildFakeQuiz({ negativeMarking: true, negativeMarkValue: 0.25 });
    const attempt = buildFakeAttempt();

    Quiz.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(quiz),
    });
    QuizAttempt.findOne = jest.fn().mockResolvedValue(attempt);

    const answers = [
      { question: 'q1', selectedOption: 'A' }, // correct
      { question: 'q2', selectedOption: 'B' }, // correct
      { question: 'q3', selectedOption: 'A' }, // wrong
      { question: 'q4', selectedOption: 'A' }, // wrong
    ];

    await submitAttempt('quiz1', 'user1', { answers, timeTakenSeconds: 90, language: 'hi' });

    expect(attempt.score).toBe(1.5);
    expect(attempt.correctCount).toBe(2);
    expect(attempt.wrongCount).toBe(2);
  });

  it('score never goes below 0 even with heavy negative marking', async () => {
    const quiz = buildFakeQuiz({ negativeMarking: true, negativeMarkValue: 2 });
    const attempt = buildFakeAttempt();

    Quiz.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(quiz),
    });
    QuizAttempt.findOne = jest.fn().mockResolvedValue(attempt);

    const answers = [
      { question: 'q1', selectedOption: 'B' }, // wrong
      { question: 'q2', selectedOption: 'A' }, // wrong
      { question: 'q3', selectedOption: 'A' }, // wrong
      { question: 'q4', selectedOption: 'A' }, // wrong
    ];

    await submitAttempt('quiz1', 'user1', { answers, timeTakenSeconds: 50, language: 'en' });

    expect(attempt.score).toBe(0); // Math.max(0, ...) guard
  });

  it('counts skipped answers (no selectedOption) correctly', async () => {
    const quiz = buildFakeQuiz();
    const attempt = buildFakeAttempt();

    Quiz.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(quiz),
    });
    QuizAttempt.findOne = jest.fn().mockResolvedValue(attempt);

    const answers = [
      { question: 'q1', selectedOption: 'A' }, // correct
      { question: 'q2', selectedOption: null }, // skipped
      { question: 'q3', selectedOption: null }, // skipped
      { question: 'q4', selectedOption: null }, // skipped
    ];

    await submitAttempt('quiz1', 'user1', { answers, timeTakenSeconds: 30, language: 'en' });

    expect(attempt.correctCount).toBe(1);
    expect(attempt.wrongCount).toBe(0);
    expect(attempt.skippedCount).toBe(3);
    expect(attempt.score).toBe(1);
  });

  it('throws 404 if no active attempt found', async () => {
    const quiz = buildFakeQuiz();
    Quiz.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(quiz),
    });
    QuizAttempt.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      submitAttempt('quiz1', 'user1', { answers: [], timeTakenSeconds: 0 })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 404 if quiz not found', async () => {
    Quiz.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(
      submitAttempt('missing-quiz', 'user1', { answers: [] })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
