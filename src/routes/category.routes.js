/**
 * category.routes.js
 * Exam category management.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validate } = require('../middleware/validate.middleware');
const validators = require('../validators/category.validator');
const { ROLES } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all active exam categories
 *     responses:
 *       200:
 *         description: List of categories
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
 *                         categories:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Categories]
 *     summary: Create a new exam category (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 $ref: '#/components/schemas/BilingualText'
 *               slug:
 *                 type: string
 *                 example: ssc
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created
 *       409:
 *         description: Slug already exists
 */
router.get('/', protect, controller.getAll);
router.post('/', protect, authorize(...ADMIN_ROLES), validate(validators.create), controller.create);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a single category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
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
 *                         category:
 *                           $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *   put:
 *     tags: [Categories]
 *     summary: Update a category (admin only)
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
 *               name:
 *                 $ref: '#/components/schemas/BilingualText'
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (superadmin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */
router.get('/:id', protect, controller.getById);
router.put('/:id', protect, authorize(...ADMIN_ROLES), validate(validators.update), controller.update);
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN), controller.remove);

module.exports = router;
