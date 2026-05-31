/**
 * question.routes.js
 * MCQ question bank management.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/question.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validate } = require('../middleware/validate.middleware');
const validators = require('../validators/question.validator');
const { ROLES } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * @openapi
 * /questions:
 *   get:
 *     tags: [Questions]
 *     summary: List questions (paginated, filterable)
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
 *       - in: query
 *         name: examCategory
 *         schema:
 *           type: string
 *         description: Filter by exam category slug
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Admin only — filter by status
 *     responses:
 *       200:
 *         description: Paginated question list
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
 *                         questions:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Question'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     tags: [Questions]
 *     summary: Create a new question (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [questionText, options, correctOption, examCategory, difficulty]
 *             properties:
 *               questionText:
 *                 $ref: '#/components/schemas/BilingualText'
 *               options:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Option'
 *               correctOption:
 *                 type: string
 *                 enum: [A, B, C, D]
 *               explanation:
 *                 $ref: '#/components/schemas/BilingualText'
 *               examCategory:
 *                 type: string
 *                 example: ssc
 *               subject:
 *                 type: string
 *               topic:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Question created as draft
 */
router.get('/', protect, validate(validators.listQuery, 'query'), controller.list);
router.post('/', protect, authorize(...ADMIN_ROLES), validate(validators.create), controller.create);

/**
 * @openapi
 * /questions/{id}:
 *   get:
 *     tags: [Questions]
 *     summary: Get a question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question detail
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
 *                         question:
 *                           $ref: '#/components/schemas/Question'
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Questions]
 *     summary: Update a question (admin only)
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
 *               questionText:
 *                 $ref: '#/components/schemas/BilingualText'
 *               options:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Option'
 *               correctOption:
 *                 type: string
 *                 enum: [A, B, C, D]
 *               explanation:
 *                 $ref: '#/components/schemas/BilingualText'
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Question updated
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Questions]
 *     summary: Delete a question (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.get('/:id', protect, controller.getById);
router.put('/:id', protect, authorize(...ADMIN_ROLES), validate(validators.update), controller.update);
router.delete('/:id', protect, authorize(...ADMIN_ROLES), controller.remove);

module.exports = router;
