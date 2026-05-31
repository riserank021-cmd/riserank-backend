/**
 * auth.controller.js
 * Thin controller — validates input (done by middleware), calls service, sends response.
 */

const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ── User Auth ─────────────────────────────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser({
    ...req.body,
    ip: req.ip,
  });

  return sendCreated(res, {
    message: 'Registration successful',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser({
    ...req.body,
    ip: req.ip,
  });

  return sendSuccess(res, {
    message: 'Login successful',
    data: result,
  });
});

const logout = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || null;
  await authService.logoutUser(req.user._id, sessionId);

  return sendSuccess(res, { message: 'Logged out successfully' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await authService.refreshUserToken(token);

  return sendSuccess(res, {
    message: 'Token refreshed',
    data: result,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changeUserPassword(req.user._id, req.body);

  return sendSuccess(res, { message: 'Password changed successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'User profile',
    data: req.user,
  });
});

const sessionHeartbeat = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || null;
  await authService.heartbeat(req.user._id, sessionId);

  return sendSuccess(res, { message: 'Heartbeat received' });
});

// ── Admin Auth ────────────────────────────────────────────────────────────────

const adminLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginAdmin({
    ...req.body,
    ip: req.ip,
  });

  return sendSuccess(res, {
    message: 'Admin login successful',
    data: result,
  });
});

// ── Email Verification ────────────────────────────────────────────────────────

const sendVerificationOTP = asyncHandler(async (req, res) => {
  const result = await otpService.sendEmailVerificationOTP(req.user._id);
  return sendSuccess(res, { message: result.message });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await otpService.verifyEmailOTP(req.user._id, req.body.otp);
  return sendSuccess(res, { message: result.message });
});

// ── Forgot / Reset Password ───────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await otpService.sendForgotPasswordOTP(req.body.email);
  return sendSuccess(res, { message: result.message });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await otpService.resetPassword(
    req.body.email,
    req.body.otp,
    req.body.newPassword
  );
  return sendSuccess(res, { message: result.message });
});

const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, device } = req.body;
  const result = await authService.googleLogin({
    idToken,
    device: device ?? 'android',
    ip: req.ip,
  });
  return sendSuccess(res, {
    message: result.isNewUser ? 'Account created with Google' : 'Signed in with Google',
    data: result,
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  getMe,
  sessionHeartbeat,
  adminLogin,
  sendVerificationOTP,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
};
