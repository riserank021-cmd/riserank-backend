/**
 * notification.routes.js
 * FCM push notification management.
 */

const express = require('express');
const router = express.Router();

const controller = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { ROLES } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * @openapi
 * /notifications/token:
 *   post:
 *     tags: [Notifications]
 *     summary: Register an FCM device token
 *     description: Stores the FCM token for the authenticated user. Max 5 tokens per user; oldest is removed if exceeded.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM registration token
 *               device:
 *                 type: string
 *                 enum: [android, ios, web]
 *                 default: android
 *     responses:
 *       200:
 *         description: Token registered
 *   delete:
 *     tags: [Notifications]
 *     summary: Remove FCM device token (call on logout)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token removed
 */
router.post('/token', protect, controller.registerToken);
router.delete('/token', protect, controller.removeToken);

/**
 * @openapi
 * /notifications/toggle:
 *   patch:
 *     tags: [Notifications]
 *     summary: Enable or disable push notifications for the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enabled]
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preference updated
 */
router.patch('/toggle', protect, controller.toggleNotifications);

/**
 * @openapi
 * /notifications/broadcast:
 *   post:
 *     tags: [Notifications]
 *     summary: Send a push notification broadcast (admin only)
 *     description: Send to all users or filter by exam category.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               examCategory:
 *                 type: string
 *                 description: If provided, only send to users with this exam in preferredExams
 *               data:
 *                 type: object
 *                 description: Optional key-value payload for the notification
 *     responses:
 *       200:
 *         description: Broadcast queued
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
 *                         sent:
 *                           type: integer
 *                         failed:
 *                           type: integer
 */
router.post('/broadcast', protect, authorize(...ADMIN_ROLES), controller.sendBroadcast);

/**
 * @openapi
 * /notifications/user/{userId}:
 *   post:
 *     tags: [Notifications]
 *     summary: Send a push notification to a specific user (admin only)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent
 *       404:
 *         description: User not found
 */
router.post('/user/:userId', protect, authorize(...ADMIN_ROLES), controller.sendToUser);

module.exports = router;
