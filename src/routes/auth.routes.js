/**
 * auth.routes.js
 * Public and protected auth routes.
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { logActivity } = require('../middleware/activityLog.middleware');
const authValidators = require('../validators/auth.validator');
const { ACTIVITY_ACTIONS } = require('../config/constants');

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *       409:
 *         description: Email already registered
 */
router.post(
  '/register',
  authLimiter,
  validate(authValidators.register),
  logActivity(ACTIVITY_ACTIONS.USER_REGISTER),
  authController.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  authLimiter,
  validate(authValidators.login),
  logActivity(ACTIVITY_ACTIONS.USER_LOGIN),
  authController.login
);

/**
 * @openapi
 * /auth/admin/login:
 *   post:
 *     tags: [Auth]
 *     summary: Admin / Super Admin login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/admin/login',
  authLimiter,
  validate(authValidators.adminLogin),
  authController.adminLogin
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token pair issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  validate(authValidators.refreshToken),
  authController.refreshToken
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate session
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post(
  '/logout',
  protect,
  logActivity(ACTIVITY_ACTIONS.USER_LOGOUT),
  authController.logout
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 */
router.get('/me', protect, authController.getMe);

/**
 * @openapi
 * /auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Change password (requires current password)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Current password incorrect
 */
router.put(
  '/change-password',
  protect,
  validate(authValidators.changePassword),
  authController.changePassword
);

/**
 * @openapi
 * /auth/heartbeat:
 *   post:
 *     tags: [Auth]
 *     summary: Session heartbeat for time-spent tracking
 *     description: Call every 30-60 seconds while user is active. Pass X-Session-ID header.
 *     parameters:
 *       - in: header
 *         name: X-Session-ID
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Heartbeat received
 */
router.post('/heartbeat', protect, authController.sessionHeartbeat);

/**
 * @openapi
 * /auth/send-verification-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send email verification OTP to authenticated user
 *     responses:
 *       200:
 *         description: OTP sent
 *       400:
 *         description: Email already verified
 */
router.post('/send-verification-otp', protect, authController.sendVerificationOTP);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email using OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-email', protect, validate(authValidators.verifyOTP), authController.verifyEmail);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent if email is registered (always 200 to prevent enumeration)
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidators.forgotPassword),
  authController.forgotPassword
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(authValidators.resetPassword),
  authController.resetPassword
);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in or register with Google
 *     description: |
 *       Accepts a Google ID token obtained from the mobile SDK
 *       (@react-native-google-signin/google-signin). Verifies the token
 *       server-side, then finds or creates a user and returns JWT tokens.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *               device:
 *                 type: string
 *                 enum: [android, ios, web]
 *                 default: android
 *     responses:
 *       200:
 *         description: Sign-in successful (existing user)
 *       201:
 *         description: Account created (new user)
 *       401:
 *         description: Invalid Google token
 */
router.post(
  '/google',
  authLimiter,
  validate(authValidators.googleAuth),
  authController.googleAuth
);

module.exports = router;
