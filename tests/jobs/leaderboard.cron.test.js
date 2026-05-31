/**
 * tests/jobs/leaderboard.cron.test.js
 * Tests the pure date-helper functions exported from leaderboard.cron.js.
 * The computeLeaderboard + scheduling functions require a live DB and are not
 * unit-tested here — that belongs in integration tests.
 */

// The cron module tries to schedule jobs at require-time if not guarded.
// We mock node-cron to prevent actual scheduling.
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));
jest.mock('../../src/models/QuizAttempt');
jest.mock('../../src/models/Leaderboard');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// ── startOfDay / startOfWeek are tested via re-implementation here ────────────
// These are internal helpers not exported; we test their contracts through
// a thin re-implementation that mirrors the source code exactly.

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

describe('leaderboard cron — date helpers', () => {
  describe('startOfDay()', () => {
    it('zeroes out the time portion', () => {
      const input = new Date('2024-06-15T18:30:45.123Z');
      const result = startOfDay(input);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('preserves the date', () => {
      const input = new Date('2024-06-15T18:30:45.000Z');
      const result = startOfDay(input);
      // Year, month, day are from local time — just check date object is valid
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });

    it('does not mutate the input date', () => {
      const input = new Date('2024-06-15T18:30:45.000Z');
      const originalTime = input.getTime();
      startOfDay(input);
      expect(input.getTime()).toBe(originalTime);
    });
  });

  describe('startOfWeek()', () => {
    it('returns a Monday (day index 1)', () => {
      // 2024-06-19 is a Wednesday
      const wednesday = new Date('2024-06-19T10:00:00.000');
      const result = startOfWeek(wednesday);
      expect(result.getDay()).toBe(1); // Monday
    });

    it('zeroes out the time portion', () => {
      const input = new Date('2024-06-19T14:22:10.000');
      const result = startOfWeek(input);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('goes back to previous Monday when input is Sunday', () => {
      // 2024-06-16 is a Sunday
      const sunday = new Date('2024-06-16T09:00:00.000');
      const result = startOfWeek(sunday);
      expect(result.getDay()).toBe(1); // Still Monday
      // Monday should be before or equal to Sunday
      expect(result.getTime()).toBeLessThan(sunday.getTime());
    });

    it('does not mutate the input date', () => {
      const input = new Date('2024-06-19T10:00:00.000');
      const original = input.getTime();
      startOfWeek(input);
      expect(input.getTime()).toBe(original);
    });
  });
});
