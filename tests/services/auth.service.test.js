/**
 * tests/services/auth.service.test.js
 * Unit tests for auth.service — all DB and token utilities are mocked.
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

jest.mock('../../src/models/User');
jest.mock('../../src/models/Admin');
jest.mock('../../src/models/Session');
jest.mock('../../src/utils/generateToken');
jest.mock('uuid', () => ({ v4: jest.fn(() => 'test-session-uuid') }));

const User = require('../../src/models/User');
const Admin = require('../../src/models/Admin');
const Session = require('../../src/models/Session');
const { generateTokenPair, verifyRefreshToken } = require('../../src/utils/generateToken');
const { registerUser, loginUser, refreshUserToken } = require('../../src/services/auth.service');

// ── Shared fake data ──────────────────────────────────────────────────────────
const FAKE_TOKENS = {
  accessToken: 'fake-access-token',
  refreshToken: 'fake-refresh-token',
};

function buildFakeUser(overrides = {}) {
  return {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    refreshToken: null,
    updateStreak: jest.fn(),
    comparePassword: jest.fn(),
    save: jest.fn().mockResolvedValue(true),
    changedPasswordAfter: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

// ── registerUser ──────────────────────────────────────────────────────────────
describe('registerUser()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generateTokenPair.mockReturnValue(FAKE_TOKENS);
    Session.create = jest.fn().mockResolvedValue({ sessionId: 'test-session-uuid' });
  });

  it('throws 409 when email is already registered', async () => {
    User.findOne = jest.fn().mockResolvedValue(buildFakeUser());

    await expect(
      registerUser({ name: 'A', email: 'test@example.com', password: 'pass', device: 'web', ip: '1.1.1.1' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates user and returns tokens + sessionId on success', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const fakeUser = buildFakeUser();
    User.create = jest.fn().mockResolvedValue(fakeUser);

    const result = await registerUser({
      name: 'Rahul',
      email: 'rahul@example.com',
      password: 'Secure@123',
      device: 'android',
      ip: '1.1.1.1',
    });

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(generateTokenPair).toHaveBeenCalledTimes(1);
    expect(Session.create).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBe(FAKE_TOKENS.accessToken);
    expect(result.refreshToken).toBe(FAKE_TOKENS.refreshToken);
    expect(result.sessionId).toBe('test-session-uuid');
  });

  it('calls updateStreak on the new user', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const fakeUser = buildFakeUser();
    User.create = jest.fn().mockResolvedValue(fakeUser);

    await registerUser({ name: 'X', email: 'x@e.com', password: 'pass', ip: '127.0.0.1' });

    expect(fakeUser.updateStreak).toHaveBeenCalledTimes(1);
  });
});

// ── loginUser ─────────────────────────────────────────────────────────────────
describe('loginUser()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generateTokenPair.mockReturnValue(FAKE_TOKENS);
    Session.create = jest.fn().mockResolvedValue({ sessionId: 'test-session-uuid' });
  });

  it('throws 401 when user is not found', async () => {
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(
      loginUser({ email: 'ghost@example.com', password: 'pass', ip: '1.1.1.1' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 401 when password is wrong', async () => {
    const fakeUser = buildFakeUser({
      comparePassword: jest.fn().mockResolvedValue(false),
      isActive: true,
      isSuspended: false,
    });
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await expect(
      loginUser({ email: 'test@example.com', password: 'wrongpass', ip: '1.1.1.1' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 403 when account is suspended', async () => {
    const fakeUser = buildFakeUser({
      comparePassword: jest.fn().mockResolvedValue(true),
      isActive: true,
      isSuspended: true,
    });
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await expect(
      loginUser({ email: 'test@example.com', password: 'pass', ip: '1.1.1.1' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('returns tokens + sessionId on successful login', async () => {
    const fakeUser = buildFakeUser({
      comparePassword: jest.fn().mockResolvedValue(true),
      isActive: true,
      isSuspended: false,
    });
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    const result = await loginUser({
      email: 'test@example.com',
      password: 'Secure@123',
      device: 'ios',
      ip: '10.0.0.1',
    });

    expect(result.accessToken).toBe(FAKE_TOKENS.accessToken);
    expect(result.sessionId).toBe('test-session-uuid');
    expect(fakeUser.save).toHaveBeenCalled();
  });
});

// ── refreshUserToken ──────────────────────────────────────────────────────────
describe('refreshUserToken()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generateTokenPair.mockReturnValue(FAKE_TOKENS);
  });

  it('throws 401 when refresh token is invalid (verifyRefreshToken throws)', async () => {
    verifyRefreshToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    await expect(refreshUserToken('bad-token')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 401 when no user found matching the token', async () => {
    verifyRefreshToken.mockReturnValue({ id: 'user123', role: 'user', model: 'User' });
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(refreshUserToken('stale-token')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns new token pair on success', async () => {
    verifyRefreshToken.mockReturnValue({ id: 'user123', role: 'user', model: 'User' });
    const fakeUser = buildFakeUser({ refreshToken: 'stale-token', isActive: true, isSuspended: false });
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    const result = await refreshUserToken('stale-token');

    expect(result.accessToken).toBe(FAKE_TOKENS.accessToken);
    expect(result.refreshToken).toBe(FAKE_TOKENS.refreshToken);
    expect(fakeUser.save).toHaveBeenCalled();
  });
});
