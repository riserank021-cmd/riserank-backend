/**
 * otp.service.js
 * OTP generation, storage, and verification.
 * Used for email verification and forgot password.
 * OTPs are stored hashed on the User document (select: false).
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const emailService = require('../utils/email.service');
const env = require('../config/env');

const OTP_EXPIRY_MINUTES = 10;

// ── Generate a 6-digit numeric OTP ───────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── Send verification OTP ─────────────────────────────────────────────────────
const sendEmailVerificationOTP = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.isEmailVerified) throw new AppError('Email is already verified', 400);

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await User.findByIdAndUpdate(userId, {
    otp: { code: hashedOtp, purpose: 'email_verification', expiresAt },
  });

  await emailService.sendVerificationOTP(user.email, user.name, otp);
  return { message: `OTP sent to ${user.email}` };
};

// ── Verify email OTP ──────────────────────────────────────────────────────────
const verifyEmailOTP = async (userId, otpInput) => {
  const user = await User.findById(userId).select('+otp');
  if (!user) throw new AppError('User not found', 404);

  if (!user.otp?.code || user.otp.purpose !== 'email_verification') {
    throw new AppError('No pending email verification', 400);
  }
  if (new Date() > user.otp.expiresAt) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  const isValid = await bcrypt.compare(otpInput, user.otp.code);
  if (!isValid) throw new AppError('Invalid OTP', 400);

  await User.findByIdAndUpdate(userId, {
    isEmailVerified: true,
    otp: { code: null, purpose: null, expiresAt: null },
  });

  return { message: 'Email verified successfully' };
};

// ── Send forgot password OTP ──────────────────────────────────────────────────
const sendForgotPasswordOTP = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  // Always return same message to prevent email enumeration
  if (!user) return { message: 'If this email is registered, an OTP has been sent.' };

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await User.findByIdAndUpdate(user._id, {
    otp: { code: hashedOtp, purpose: 'password_reset', expiresAt },
  });

  await emailService.sendForgotPasswordOTP(user.email, user.name, otp);
  return { message: 'If this email is registered, an OTP has been sent.' };
};

// ── Reset password with OTP ───────────────────────────────────────────────────
const resetPassword = async (email, otpInput, newPassword) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +password');
  if (!user) throw new AppError('Invalid request', 400);

  if (!user.otp?.code || user.otp.purpose !== 'password_reset') {
    throw new AppError('No pending password reset request', 400);
  }
  if (new Date() > user.otp.expiresAt) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  const isValid = await bcrypt.compare(otpInput, user.otp.code);
  if (!isValid) throw new AppError('Invalid OTP', 400);

  user.password = newPassword;
  user.otp = { code: null, purpose: null, expiresAt: null };
  user.refreshToken = null; // Invalidate all sessions
  await user.save();

  await emailService.sendPasswordChangedAlert(user.email, user.name);
  return { message: 'Password reset successfully. Please log in with your new password.' };
};

module.exports = {
  sendEmailVerificationOTP,
  verifyEmailOTP,
  sendForgotPasswordOTP,
  resetPassword,
};
