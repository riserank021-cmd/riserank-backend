/**
 * upload.routes.js
 * File upload endpoints — S3/R2 backed.
 */

const express = require('express');
const router = express.Router();

const controller = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const { ROLES } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * @openapi
 * /upload/avatar:
 *   post:
 *     tags: [Upload]
 *     summary: Upload user avatar image
 *     description: Accepts JPEG, PNG, or WebP up to 5MB. Returns the public URL.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
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
 *                         url:
 *                           type: string
 *                           example: https://cdn.riserank.in/avatars/user-id.jpg
 *       400:
 *         description: No file uploaded or invalid type
 */
router.post(
  '/avatar',
  protect,
  uploadSingle('avatar'),
  controller.uploadAvatar
);

/**
 * @openapi
 * /upload/current-affairs/{id}:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a cover image for a current affair article (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Current affair document ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded and attached to the current affair
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
 *                         url:
 *                           type: string
 *       400:
 *         description: No file or invalid type
 *       404:
 *         description: Current affair not found
 */
router.post(
  '/current-affairs/:id',
  protect,
  authorize(...ADMIN_ROLES),
  uploadSingle('image'),
  controller.uploadCurrentAffairImage
);

module.exports = router;
