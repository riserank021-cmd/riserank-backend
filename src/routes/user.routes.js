/**
 * user.routes.js
 * User profile, bookmarks, reports, and leaderboard.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const validators = require('../validators/user.validator');

// All user routes require authentication
router.use(protect);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
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
router.get('/profile', controller.getProfile);

/**
 * @openapi
 * /users/category-stats:
 *   get:
 *     tags: [Users]
 *     summary: Get per-category accuracy stats for the current user
 *     responses:
 *       200:
 *         description: Array of category accuracy objects
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
 *                         stats:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               categoryId: { type: string }
 *                               categoryName:
 *                                 type: object
 *                                 properties:
 *                                   en: { type: string }
 *                                   hi: { type: string }
 *                               totalAttempts: { type: integer }
 *                               totalCorrect: { type: integer }
 *                               totalQuestions: { type: integer }
 *                               accuracy: { type: number }
 */
router.get('/category-stats', controller.getCategoryStats);

/**
 * @openapi
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *                 enum: [en, hi]
 *               preferredExams:
 *                 type: array
 *                 items:
 *                   type: string
 *               state:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 */
router.put('/profile', validate(validators.updateProfile), controller.updateProfile);

/**
 * @openapi
 * /users/bookmarks:
 *   get:
 *     tags: [Users]
 *     summary: Get all bookmarked questions
 *     responses:
 *       200:
 *         description: List of bookmarked questions
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
 *                         bookmarks:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Question'
 */
router.get('/bookmarks', controller.getBookmarks);

/**
 * @openapi
 * /users/bookmarks/{questionId}:
 *   post:
 *     tags: [Users]
 *     summary: Add a question to bookmarks
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question bookmarked
 *       404:
 *         description: Question not found
 *   delete:
 *     tags: [Users]
 *     summary: Remove a question from bookmarks
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark removed
 */
router.post('/bookmarks/:questionId', validate(validators.addBookmark), controller.addBookmark);
router.delete('/bookmarks/:questionId', controller.removeBookmark);

/**
 * @openapi
 * /users/report/{questionId}:
 *   post:
 *     tags: [Users]
 *     summary: Report a question for review
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [wrong_answer, typo, outdated, offensive, other]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report submitted
 *       404:
 *         description: Question not found
 */
router.post('/report/:questionId', validate(validators.reportQuestion), controller.reportQuestion);

/**
 * @openapi
 * /users/leaderboard:
 *   get:
 *     tags: [Users]
 *     summary: Get leaderboard
 *     parameters:
 *       - in: query
 *         name: periodType
 *         schema:
 *           type: string
 *           enum: [daily, weekly, alltime]
 *         description: Leaderboard period (default alltime)
 *       - in: query
 *         name: examCategory
 *         schema:
 *           type: string
 *         description: Filter by exam category (default all)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Leaderboard entries
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
 *                         leaderboard:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/LeaderboardEntry'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/leaderboard', validate(validators.leaderboardQuery, 'query'), controller.getLeaderboard);

/**
 * @openapi
 * /users/leaderboard/my-rank:
 *   get:
 *     tags: [Users]
 *     summary: Get authenticated user's rank on the leaderboard
 *     parameters:
 *       - in: query
 *         name: periodType
 *         schema:
 *           type: string
 *           enum: [daily, weekly, alltime]
 *       - in: query
 *         name: examCategory
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User rank
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
 *                         rank:
 *                           type: integer
 *                           example: 42
 *                         entry:
 *                           $ref: '#/components/schemas/LeaderboardEntry'
 */
router.get('/leaderboard/my-rank', controller.getMyRank);

module.exports = router;
