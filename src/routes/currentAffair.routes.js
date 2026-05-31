/**
 * currentAffair.routes.js
 * Bilingual current affairs CRUD.
 */

const express = require('express');
const router = express.Router();

const controller = require('../controllers/currentAffair.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validate } = require('../middleware/validate.middleware');
const { logActivity } = require('../middleware/activityLog.middleware');
const validators = require('../validators/currentAffair.validator');
const { ROLES, ACTIVITY_ACTIONS } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * @openapi
 * /current-affairs:
 *   get:
 *     tags: [Current Affairs]
 *     summary: List published current affairs (paginated)
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
 *         name: examTag
 *         schema:
 *           type: string
 *         description: Filter by exam tag (e.g. ssc, banking)
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter publishedAt >= from (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter publishedAt <= to (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Admins can filter by status; users always see published only
 *     responses:
 *       200:
 *         description: Paginated list of current affairs
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
 *                         currentAffairs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/CurrentAffair'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     tags: [Current Affairs]
 *     summary: Create a current affair article (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 $ref: '#/components/schemas/BilingualText'
 *               body:
 *                 $ref: '#/components/schemas/BilingualText'
 *               summary:
 *                 $ref: '#/components/schemas/BilingualText'
 *               examTags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [ssc, banking]
 *     responses:
 *       201:
 *         description: Current affair created as draft
 */
router.get('/', protect, validate(validators.listQuery, 'query'), controller.list);
router.post(
  '/',
  protect,
  authorize(...ADMIN_ROLES),
  validate(validators.create),
  logActivity(ACTIVITY_ACTIONS.CURRENT_AFFAIR_CREATE),
  controller.create
);

/**
 * @openapi
 * /current-affairs/{id}:
 *   get:
 *     tags: [Current Affairs]
 *     summary: Get a single current affair by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current affair article
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
 *                         currentAffair:
 *                           $ref: '#/components/schemas/CurrentAffair'
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Current Affairs]
 *     summary: Update a current affair (admin only)
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
 *               body:
 *                 $ref: '#/components/schemas/BilingualText'
 *               summary:
 *                 $ref: '#/components/schemas/BilingualText'
 *               examTags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Current Affairs]
 *     summary: Delete a current affair (admin only)
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
router.put(
  '/:id',
  protect,
  authorize(...ADMIN_ROLES),
  validate(validators.update),
  logActivity(ACTIVITY_ACTIONS.CURRENT_AFFAIR_UPDATE),
  controller.update
);
router.delete(
  '/:id',
  protect,
  authorize(...ADMIN_ROLES),
  logActivity(ACTIVITY_ACTIONS.CURRENT_AFFAIR_DELETE),
  controller.remove
);

/**
 * @openapi
 * /current-affairs/{id}/publish:
 *   patch:
 *     tags: [Current Affairs]
 *     summary: Publish a current affair (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Published
 *       400:
 *         description: Already published
 *       404:
 *         description: Not found
 */
router.patch(
  '/:id/publish',
  protect,
  authorize(...ADMIN_ROLES),
  logActivity(ACTIVITY_ACTIONS.CURRENT_AFFAIR_PUBLISH),
  controller.publish
);

/**
 * @openapi
 * /current-affairs/{id}/archive:
 *   patch:
 *     tags: [Current Affairs]
 *     summary: Archive a current affair (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived
 *       404:
 *         description: Not found
 */
router.patch(
  '/:id/archive',
  protect,
  authorize(...ADMIN_ROLES),
  logActivity(ACTIVITY_ACTIONS.CURRENT_AFFAIR_ARCHIVE),
  controller.archive
);

module.exports = router;
