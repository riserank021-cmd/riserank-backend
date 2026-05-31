/**
 * tests/utils/apiResponse.test.js
 * Unit tests for apiResponse utility helpers.
 */

const {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendBadRequest,
  sendConflict,
} = require('../../src/utils/apiResponse');

describe('apiResponse', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ── sendSuccess ──────────────────────────────────────────────────────────────
  describe('sendSuccess()', () => {
    it('sends 200 by default with success: true', () => {
      sendSuccess(res, { message: 'OK', data: { foo: 'bar' } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'OK', data: { foo: 'bar' } })
      );
    });

    it('uses the supplied statusCode', () => {
      sendSuccess(res, { statusCode: 201, message: 'Created', data: {} });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('omits data key when data is null', () => {
      sendSuccess(res, { message: 'OK' });
      const payload = res.json.mock.calls[0][0];
      expect(payload).not.toHaveProperty('data');
    });

    it('includes pagination when provided', () => {
      const pagination = { total: 100, page: 1, limit: 20, totalPages: 5 };
      sendSuccess(res, { message: 'Listed', data: {}, pagination });
      const payload = res.json.mock.calls[0][0];
      expect(payload.pagination).toEqual(pagination);
    });

    it('omits pagination key when not provided', () => {
      sendSuccess(res, { message: 'OK', data: {} });
      const payload = res.json.mock.calls[0][0];
      expect(payload).not.toHaveProperty('pagination');
    });
  });

  // ── sendCreated ──────────────────────────────────────────────────────────────
  describe('sendCreated()', () => {
    it('sends 201 with created message', () => {
      sendCreated(res, { message: 'User created', data: { id: '1' } });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'User created' })
      );
    });
  });

  // ── sendError ────────────────────────────────────────────────────────────────
  describe('sendError()', () => {
    it('sends the given status with success: false', () => {
      sendError(res, { statusCode: 404, message: 'Not found' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Not found' })
      );
    });

    it('defaults to 500 when no statusCode provided', () => {
      sendError(res, { message: 'Server error' });
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('includes errors array when provided', () => {
      const errors = [{ field: 'email', message: 'required' }];
      sendError(res, { statusCode: 400, message: 'Validation', errors });
      const payload = res.json.mock.calls[0][0];
      expect(payload.errors).toEqual(errors);
    });

    it('omits errors key when not provided', () => {
      sendError(res, { statusCode: 400, message: 'Bad' });
      const payload = res.json.mock.calls[0][0];
      expect(payload).not.toHaveProperty('errors');
    });
  });

  // ── Convenience helpers ──────────────────────────────────────────────────────
  describe('sendNotFound()', () => {
    it('sends 404', () => {
      sendNotFound(res, 'Quiz not found');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json.mock.calls[0][0]).toMatchObject({ success: false, message: 'Quiz not found' });
    });
  });

  describe('sendUnauthorized()', () => {
    it('sends 401', () => {
      sendUnauthorized(res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json.mock.calls[0][0].success).toBe(false);
    });
  });

  describe('sendForbidden()', () => {
    it('sends 403', () => {
      sendForbidden(res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('sendBadRequest()', () => {
    it('sends 400 with optional errors array', () => {
      const errors = [{ field: 'name', message: 'required' }];
      sendBadRequest(res, 'Validation failed', errors);
      expect(res.status).toHaveBeenCalledWith(400);
      const payload = res.json.mock.calls[0][0];
      expect(payload.errors).toEqual(errors);
    });
  });

  describe('sendConflict()', () => {
    it('sends 409', () => {
      sendConflict(res, 'Email already exists');
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});
