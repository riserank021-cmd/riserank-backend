/**
 * quiz.routes.js
 * Quiz creation, attempts, and scoring.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validate } = require('../middleware/validate.middleware');
const { quizSubmitLimiter } = require('../middleware/rateLimit.middleware');
const validators = require('../validators/quiz.validator');
const { ROLES } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * @openapi
 * /quizzes/daily:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get today's daily quiz
 *     responses:
 *       200:
 *         description: Today's daily quiz (without correct answers)
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
 *                         quiz:
 *                           $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: No daily quiz scheduled for today
 */
router.get('/daily', protect, controller.getDaily);

/**
 * @openapi
 * /quizzes/history:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get authenticated user's quiz attempt history
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
 *           default: 20
 *     responses:
 *       200:
 *         description: List of past attempts
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
 *                         attempts:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/QuizAttempt'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/history', protect, controller.getAttemptHistory);

/**
 * @openapi
 * /quiz/attempt/{attemptId}:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get a single completed attempt by ID (used by result + review screens)
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt with populated quiz and question details
 *       404:
 *         description: Attempt not found
 */
router.get('/attempt/:attemptId', protect, controller.getAttemptById);

/**
 * @openapi
 * /quizzes:
 *   get:
 *     tags: [Quizzes]
 *     summary: List published quizzes (paginated)
 *     parameters:
 *       - in: query
 *         name: examCategory
 *         schema:
 *           type: string
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
 *         description: Paginated quiz list
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
 *                         quizzes:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Quiz'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     tags: [Quizzes]
 *     summary: Create a quiz (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, examCategory, durationSeconds, questions]
 *             properties:
 *               title:
 *                 $ref: '#/components/schemas/BilingualText'
 *               examCategory:
 *                 type: string
 *                 example: ssc
 *               durationSeconds:
 *                 type: integer
 *                 example: 600
 *               isDaily:
 *                 type: boolean
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of question IDs
 *               negativeMarking:
 *                 type: number
 *                 example: 0.25
 *     responses:
 *       201:
 *         description: Quiz created as draft
 */
router.get('/', protect, controller.list);
router.post('/', protect, authorize(...ADMIN_ROLES), validate(validators.create), controller.create);

/**
 * @openapi
 * /quizzes/{id}:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get a quiz by ID (without correct answers)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz detail
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Quizzes]
 *     summary: Update a quiz (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 $ref: '#/components/schemas/BilingualText'
 *               durationSeconds:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Quiz updated
 *   delete:
 *     tags: [Quizzes]
 *     summary: Delete a quiz (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/:id', protect, controller.getById);
router.put('/:id', protect, authorize(...ADMIN_ROLES), validate(validators.update), controller.update);
router.delete('/:id', protect, authorize(...ADMIN_ROLES), controller.remove);

/**
 * @openapi
 * /quizzes/{id}/start:
 *   post:
 *     tags: [Quizzes]
 *     summary: Start a quiz attempt (creates an in-progress attempt)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt started, returns attempt ID and questions
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
 *                         attemptId:
 *                           type: string
 *                         questions:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Question'
 *       400:
 *         description: Already attempted or quiz not published
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/start', protect, controller.startAttempt);

/**
 * @openapi
 * /quizzes/{id}/submit:
 *   post:
 *     tags: [Quizzes]
 *     summary: Submit answers for a quiz attempt
 *     description: Rate limited to 5 submissions per 10 minutes.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attemptId, answers]
 *             properties:
 *               attemptId:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId, selectedOption]
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedOption:
 *                       type: string
 *                       enum: [A, B, C, D]
 *               timeTakenSeconds:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Attempt scored
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
 *                         attempt:
 *                           $ref: '#/components/schemas/QuizAttempt'
 *       400:
 *         description: Already submitted or invalid attempt
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/:id/submit', protect, quizSubmitLimiter, validate(validators.submitAttempt), controller.submitAttempt);

module.exports = router;
