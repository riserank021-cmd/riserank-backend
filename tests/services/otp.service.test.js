/**
 * tests/services/otp.service.test.js
 * Unit tests for OTP service — verifyEmailOTP, sendForgotPasswordOTP, resetPassword.
 */

jest.mock('../../src/models/User');
jest.mock('../../src/utils/email.service', () => ({
  // Exact function names from src/utils/email.service.js exports
  sendEmail: jest.fn().mockResolvedValue(true),
  sendVerificationOTP: jest.fn().mockResolvedValue(true),
  sendForgotPasswordOTP: jest.fn().mockResolvedValue(true),
  sendPasswordChangedAlert: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-otp'),
  compare: jest.fn(),
  hashSync: jest.fn().mockReturnValue('hashed-otp'),
  compareSync: jest.fn().mockReturnValue(false),
}));
jest.mock('../../src/config/env', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  isProduction: false,
}));

const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const { verifyEmailOTP, sendForgotPasswordOTP, resetPassword } = require('../../src/services/otp.service');

// ── verifyEmailOTP ────────────────────────────────────────────────────────────
describe('verifyEmailOTP()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: findByIdAndUpdate resolves silently
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
  });

  it('throws 400 when user has no pending OTP', async () => {
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: null,
        save: jest.fn(),
      }),
    });

    await expect(verifyEmailOTP('u1', '123456')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 when OTP purpose does not match', async () => {
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: {
          code: 'hashed-otp',
          purpose: 'password_reset', // wrong purpose
          expiresAt: new Date(Date.now() + 600_000),
        },
        save: jest.fn(),
      }),
    });

    await expect(verifyEmailOTP('u1', '123456')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 when OTP is expired', async () => {
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: {
          code: 'hashed-otp',
          purpose: 'email_verification',
          expiresAt: new Date(Date.now() - 60_000), // expired 1 minute ago
        },
        save: jest.fn(),
      }),
    });
    bcrypt.compare.mockResolvedValue(true);

    await expect(verifyEmailOTP('u1', '123456')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 when OTP code is wrong', async () => {
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: {
          code: 'hashed-otp',
          purpose: 'email_verification',
          expiresAt: new Date(Date.now() + 600_000),
        },
        save: jest.fn(),
      }),
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(verifyEmailOTP('u1', '999999')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('calls findByIdAndUpdate with isEmailVerified:true on correct OTP', async () => {
    // The service uses findByIdAndUpdate — NOT direct mutation of the user object
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: {
          code: 'hashed-otp',
          purpose: 'email_verification',
          expiresAt: new Date(Date.now() + 600_000),
        },
      }),
    });
    bcrypt.compare.mockResolvedValue(true);

    await verifyEmailOTP('u1', '123456');

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ isEmailVerified: true })
    );
  });

  it('returns a success message on correct OTP', async () => {
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: {
          code: 'hashed-otp',
          purpose: 'email_verification',
          expiresAt: new Date(Date.now() + 600_000),
        },
      }),
    });
    bcrypt.compare.mockResolvedValue(true);

    const result = await verifyEmailOTP('u1', '123456');

    expect(result).toHaveProperty('message');
    expect(typeof result.message).toBe('string');
  });
});

// ── sendForgotPasswordOTP ─────────────────────────────────────────────────────
describe('sendForgotPasswordOTP()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
  });

  it('always returns the same message regardless of whether email exists (anti-enumeration)', async () => {
    // When user is NOT found — early return with same message
    User.findOne = jest.fn().mockResolvedValue(null);
    const resultNoUser = await sendForgotPasswordOTP('ghost@example.com');
    expect(resultNoUser.message).toBeDefined();

    // When user IS found
    User.findOne = jest.fn().mockResolvedValue({
      _id: 'u1',
      email: 'test@e.com',
      name: 'Test',
    });
    const resultWithUser = await sendForgotPasswordOTP('test@e.com');
    expect(resultWithUser.message).toBeDefined();

    // Both messages must be identical (prevents email enumeration)
    expect(resultNoUser.message).toBe(resultWithUser.message);
  });

  it('does NOT send email when user is not found', async () => {
    const emailService = require('../../src/utils/email.service');
    User.findOne = jest.fn().mockResolvedValue(null);

    await sendForgotPasswordOTP('ghost@example.com');

    expect(emailService.sendForgotPasswordOTP).not.toHaveBeenCalled();
  });

  it('sends email when user is found', async () => {
    const emailService = require('../../src/utils/email.service');
    User.findOne = jest.fn().mockResolvedValue({ _id: 'u1', email: 'test@e.com', name: 'Test' });

    await sendForgotPasswordOTP('test@e.com');

    expect(emailService.sendForgotPasswordOTP).toHaveBeenCalledTimes(1);
  });
});

// ── resetPassword ─────────────────────────────────────────────────────────────
describe('resetPassword()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws 400 (not 404) when email is not found — anti-enumeration', async () => {
    // The service throws 400 "Invalid request" (not 404) to prevent email enumeration
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(
      resetPassword('ghost@example.com', '123456', 'newPass123')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 when OTP is invalid', async () => {
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: {
          code: 'hashed-otp',
          purpose: 'password_reset',
          expiresAt: new Date(Date.now() + 600_000),
        },
        save: jest.fn(),
      }),
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      resetPassword('test@example.com', '000000', 'newPass123')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 when OTP is expired', async () => {
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        otp: {
          code: 'hashed-otp',
          purpose: 'password_reset',
          expiresAt: new Date(Date.now() - 60_000), // expired
        },
        save: jest.fn(),
      }),
    });

    await expect(
      resetPassword('test@example.com', '123456', 'newPass123')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('resets password, clears OTP and refreshToken on success', async () => {
    const fakeSave = jest.fn().mockResolvedValue(true);
    const fakeUser = {
      _id: 'u1',
      email: 'test@e.com',
      name: 'Test',
      password: 'old-password',
      refreshToken: 'some-token',
      otp: {
        code: 'hashed-otp',
        purpose: 'password_reset',
        expiresAt: new Date(Date.now() + 600_000),
      },
      save: fakeSave,
    };
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });
    bcrypt.compare.mockResolvedValue(true);

    await resetPassword('test@e.com', '123456', 'NewSecurePass@1');

    expect(fakeUser.password).toBe('NewSecurePass@1');
    expect(fakeUser.refreshToken).toBeNull();
    expect(fakeUser.otp.code).toBeNull();
    expect(fakeSave).toHaveBeenCalledTimes(1);
  });
});
