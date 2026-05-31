/**
 * tests/utils/AppError.test.js
 * Unit tests for the AppError class.
 */

const AppError = require('../../src/utils/AppError');

describe('AppError', () => {
  it('creates an operational error with correct statusCode', () => {
    const err = new AppError('Not found', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  it('sets status to "error" for 5xx codes', () => {
    const err = new AppError('Server error', 500);
    expect(err.status).toBe('error');
  });

  it('sets status to "fail" for 4xx codes', () => {
    const err = new AppError('Bad request', 400);
    expect(err.status).toBe('fail');
  });

  it('captures a stack trace', () => {
    const err = new AppError('Oops', 400);
    expect(err.stack).toBeDefined();
  });
});
