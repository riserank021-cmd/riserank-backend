/**
 * tests/middleware/authorize.test.js
 * Unit tests for the authorize RBAC middleware.
 */

const { authorize } = require('../../src/middleware/authorize.middleware');
const { ROLES } = require('../../src/config/constants');

describe('authorize middleware', () => {
  let req, res, next;

  beforeEach(() => {
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('calls next() when user role is in allowed list', () => {
    req = { user: { role: ROLES.ADMIN } };
    const mw = authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN);
    mw(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // no arguments = no error
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for superadmin when superadmin is allowed', () => {
    req = { user: { role: ROLES.SUPER_ADMIN } };
    const mw = authorize(ROLES.SUPER_ADMIN);
    mw(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('returns 403 when role is not in allowed list', () => {
    req = { user: { role: ROLES.USER } };
    const mw = authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN);
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when req.user is missing', () => {
    req = {};
    const mw = authorize(ROLES.ADMIN);
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows the same role that is the only one specified', () => {
    req = { user: { role: ROLES.SUPER_ADMIN } };
    const mw = authorize(ROLES.SUPER_ADMIN);
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('denies user role when only superadmin is allowed', () => {
    req = { user: { role: ROLES.USER } };
    const mw = authorize(ROLES.SUPER_ADMIN);
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
