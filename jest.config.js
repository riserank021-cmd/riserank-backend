/**
 * jest.config.js
 * Jest configuration for RiseRank backend unit tests.
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/swagger.js',
    '!src/jobs/**',
  ],
  coverageThreshold: {
    global: {
      lines: 60,
    },
  },
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  // Increase timeout for async tests
  testTimeout: 10000,
};
