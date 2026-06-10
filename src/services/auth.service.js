/**
 * auth.service.js
 * Business logic for authentication.
 * Controllers call these — never talk to models directly from controllers.
 */

const User = require('../models/User');
const Admin = require('../models/Admin');
const Session = require('../models/Session');
const { generateTokenPair, verifyRefreshToken } = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');
const otpService = require('../services/otp.service');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const buildTokenPayload = (user, model) => ({
  id: user._id,
  role: user.role,
  model, // 'User' or 'Admin'
});

const getDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// ─────────────────────────────────────────────
// USER AUTH
// ─────────────────────────────────────────────

const registerUser = async ({ name, email, password, phone, preferredLanguage, device = 'web', ip }) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create({ name, email, password, phone, preferredLanguage });

  // Send email verification OTP (fire-and-forget — don't block registration)
  otpService.sendEmailVerificationOTP(user._id).catch(() => {});

  // Update streak on first login
  user.updateStreak();
  user.lastLoginAt = new Date();
  user.lastLoginIP = ip;
  await user.save({ validateBeforeSave: false });

  const payload = buildTokenPayload(user, 'User');
  const { accessToken, refreshToken } = generateTokenPair(payload);

  // Save refresh token hash on user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Create session
  const sessionId = uuidv4();
  await Session.create({
    user: user._id,
    sessionId,
    startedAt: new Date(),
    device,
    ipAddress: ip,
    dateKey: getDateKey(),
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
    sessionId,
  };
};

const loginUser = async ({ email, password, device = 'web', ip }) => {
  // Fetch user with password (select: false by default)
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.isSuspended) {
    throw new AppError('Your account has been suspended. Contact support.', 403);
  }

  // Update streak
  user.updateStreak();
  user.lastLoginAt = new Date();
  user.lastLoginIP = ip;

  const payload = buildTokenPayload(user, 'User');
  const { accessToken, refreshToken } = generateTokenPair(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Create session
  const sessionId = uuidv4();
  await Session.create({
    user: user._id,
    sessionId,
    startedAt: new Date(),
    device,
    ipAddress: ip,
    dateKey: getDateKey(),
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
    sessionId,
  };
};

const logoutUser = async (userId, sessionId) => {
  // Clear refresh token
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  // End session
  if (sessionId) {
    const session = await Session.findOne({ sessionId });
    if (session) {
      const now = new Date();
      const duration = Math.floor((now - session.startedAt) / 1000);
      session.endedAt = now;
      session.durationSeconds = duration;
      session.isActive = false;
      await session.save();

      // Add to user's total time
      await User.findByIdAndUpdate(userId, {
        $inc: { totalTimeSpentSeconds: duration },
      });
    }
  }
};

const refreshUserToken = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const Model = decoded.model === 'Admin' ? Admin : User;
  const user = await Model.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token mismatch. Please log in again.', 401);
  }

  const payload = buildTokenPayload(user, decoded.model);
  const { accessToken, refreshToken } = generateTokenPair(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();
};

// ─────────────────────────────────────────────
// ADMIN AUTH
// ─────────────────────────────────────────────

const loginAdmin = async ({ email, password, ip }) => {
  const admin = await Admin.findOne({ email }).select('+password +refreshToken');

  if (!admin || !(await admin.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!admin.isActive) {
    throw new AppError('Admin account is deactivated.', 403);
  }

  admin.lastLoginAt = new Date();
  admin.lastLoginIP = ip;

  const payload = buildTokenPayload(admin, 'Admin');
  const { accessToken, refreshToken } = generateTokenPair(payload);

  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  return {
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    accessToken,
    refreshToken,
  };
};

// ─────────────────────────────────────────────
// SESSION HEARTBEAT
// ─────────────────────────────────────────────

const heartbeat = async (userId, sessionId) => {
  if (!sessionId) return;

  const now = new Date();
  const session = await Session.findOne({ sessionId, user: userId });

  if (!session || !session.isActive) return;

  const duration = Math.floor((now - session.startedAt) / 1000);
  session.lastHeartbeatAt = now;
  session.durationSeconds = duration;
  await session.save();
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  avatar: user.avatar ?? null,
  state: user.state ?? null,
  role: user.role,
  authProvider: user.authProvider ?? 'local',
  isEmailVerified: user.isEmailVerified ?? false,
  isActive: user.isActive ?? true,
  isSuspended: user.isSuspended ?? false,
  notificationsEnabled: user.notificationsEnabled ?? true,
  preferredLanguage: user.preferredLanguage,
  preferredExams: user.preferredExams ?? [],
  currentStreak: user.currentStreak ?? 0,
  longestStreak: user.longestStreak ?? 0,
  lastActiveDate: user.lastActiveDate ?? null,
  totalQuizAttempts: user.totalQuizAttempts ?? 0,
  totalCorrect: user.totalCorrect ?? 0,
  totalAnswered: user.totalAnswered ?? 0,
  totalTimeSpentSeconds: user.totalTimeSpentSeconds ?? 0,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ─────────────────────────────────────────────
// GOOGLE OAUTH
// ─────────────────────────────────────────────

const { OAuth2Client } = require('google-auth-library');

const getGoogleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify a Google ID token from the mobile SDK and sign in (or auto-register).
 */
const googleLogin = async ({ idToken, device = 'android', ip }) => {
  // 1. Verify the ID token with Google
  let gPayload;
  try {
    const ticket = await getGoogleClient().verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    gPayload = ticket.getPayload();
  } catch {
    throw new AppError('Invalid Google token', 401);
  }

  const { sub: googleId, email, name, picture } = gPayload;
  if (!email) throw new AppError('Google account has no email address', 400);

  // 2. Find by googleId or email (covers link case)
  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+googleId');
  let isNewUser = false;

  if (user) {
    // Link Google to an existing email/password account on first OAuth login
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = 'google';
      user.isEmailVerified = true;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // 3. Auto-create account from Google profile
    user = await User.create({
      name: name ?? email.split('@')[0],
      email,
      googleId,
      authProvider: 'google',
      avatar: picture ?? null,
      isEmailVerified: true,
      // password intentionally omitted for OAuth users
    });
    isNewUser = true;
  }

  if (user.isSuspended) throw new AppError('Your account has been suspended', 403);

  // 4. Streak + session (same as password login)
  user.updateStreak();
  user.lastLoginAt = new Date();
  user.lastLoginIP = ip;
  await user.save({ validateBeforeSave: false });

  const tokenPayload = buildTokenPayload(user, 'User');
  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const sessionId = uuidv4();
  await Session.create({
    user: user._id,
    sessionId,
    startedAt: new Date(),
    device,
    ipAddress: ip,
    dateKey: getDateKey(),
  });

  return { user: sanitizeUser(user), accessToken, refreshToken, sessionId, isNewUser };
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  changeUserPassword,
  loginAdmin,
  heartbeat,
  googleLogin,
};
