/**
 * analytics.routes.js
 * Platform analytics — superadmin only.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { ROLES } = require('../config/constants');

// All analytics routes: Super Admin only
router.use(protect, authorize(ROLES.SUPER_ADMIN));

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Platform overview stats (superadmin only)
 *     description: Returns totals for users, quizzes, questions, current affairs, and active sessions.
 *     responses:
 *       200:
 *         description: Overview stats
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
 *                         totalUsers:
 *                           type: integer
 *                         totalQuizzes:
 *                           type: integer
 *                         totalQuestions:
 *                           type: integer
 *                         totalCurrentAffairs:
 *                           type: integer
 *                         activeSessions:
 *                           type: integer
 */
router.get('/overview', controller.overview);

/**
 * @openapi
 * /analytics/dau:
 *   get:
 *     tags: [Analytics]
 *     summary: Daily active users for the last N days (superadmin only)
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: DAU time series
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
 *                         dau:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               count:
 *                                 type: integer
 */
router.get('/dau', controller.dailyActiveUsers);

/**
 * @openapi
 * /analytics/session-duration:
 *   get:
 *     tags: [Analytics]
 *     summary: Average session duration stats (superadmin only)
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Session duration analytics
 */
router.get('/session-duration', controller.sessionDuration);

/**
 * @openapi
 * /analytics/quiz-stats:
 *   get:
 *     tags: [Analytics]
 *     summary: Quiz attempt statistics by category (superadmin only)
 *     responses:
 *       200:
 *         description: Quiz stats per exam category
 */
router.get('/quiz-stats', controller.quizStats);

/**
 * @openapi
 * /analytics/most-active-users:
 *   get:
 *     tags: [Analytics]
 *     summary: Top N most active users by quiz attempts (superadmin only)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most active users
 */
router.get('/most-active-users', controller.mostActiveUsers);

/**
 * @openapi
 * /analytics/user-growth:
 *   get:
 *     tags: [Analytics]
 *     summary: User registration growth over time (superadmin only)
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Daily registration counts
 */
router.get('/user-growth', controller.userGrowth);

/**
 * @openapi
 * /analytics/admin-logs:
 *   get:
 *     tags: [Analytics]
 *     summary: Recent admin activity logs (superadmin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by activity action type
 *     responses:
 *       200:
 *         description: Admin activity log entries
 */
router.get('/admin-logs', controller.adminActivityLogs);

module.exports = router;
