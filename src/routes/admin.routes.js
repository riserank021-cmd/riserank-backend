/**
 * admin.routes.js
 * Routes for admin and superadmin management operations.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validate } = require('../middleware/validate.middleware');
const validators = require('../validators/admin.validator');
const { ROLES } = require('../config/constants');

const SUPER_ADMIN = [ROLES.SUPER_ADMIN];
const ALL_ADMINS = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

router.use(protect);

/**
 * @openapi
 * /admin/me:
 *   get:
 *     tags: [Admin]
 *     summary: Get current admin's profile
 *     responses:
 *       200:
 *         description: Admin profile
 */
router.get('/me', authorize(...ALL_ADMINS), controller.getAdminProfile);

/**
 * @openapi
 * /admin/me/change-password:
 *   put:
 *     tags: [Admin]
 *     summary: Change admin's own password
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
router.put('/me/change-password', authorize(...ALL_ADMINS), validate(validators.changePassword), controller.changeAdminPassword);

/**
 * @openapi
 * /admin/admins:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new admin account (superadmin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [admin, superadmin]
 *                 default: admin
 *     responses:
 *       201:
 *         description: Admin created
 *       409:
 *         description: Email already in use
 *   get:
 *     tags: [Admin]
 *     summary: List all admins (superadmin only)
 *     responses:
 *       200:
 *         description: List of admins
 */
router.post('/admins', authorize(...SUPER_ADMIN), validate(validators.createAdmin), controller.createAdmin);
router.get('/admins', authorize(...SUPER_ADMIN), controller.listAdmins);

/**
 * @openapi
 * /admin/admins/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete an admin account (superadmin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted
 *       404:
 *         description: Admin not found
 */
router.delete('/admins/:id', authorize(...SUPER_ADMIN), controller.deleteAdmin);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (admin only)
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: isSuspended
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated user list
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
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/users', authorize(...ALL_ADMINS), controller.listUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a single user by ID (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user (superadmin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.get('/users/:id', authorize(...ALL_ADMINS), controller.getUserById);
router.delete('/users/:id', authorize(...SUPER_ADMIN), controller.deleteUser);

/**
 * @openapi
 * /admin/users/{id}/suspend:
 *   patch:
 *     tags: [Admin]
 *     summary: Suspend a user account (admin only)
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
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: User suspended
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/suspend', authorize(...ALL_ADMINS), validate(validators.suspendUser), controller.suspendUser);

/**
 * @openapi
 * /admin/users/{id}/unsuspend:
 *   patch:
 *     tags: [Admin]
 *     summary: Unsuspend a user account (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unsuspended
 */
router.patch('/users/:id/unsuspend', authorize(...ALL_ADMINS), controller.unsuspendUser);

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: List user-submitted question reports (admin only)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, dismissed]
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
 *         description: List of reports
 */
router.get('/reports', authorize(...ALL_ADMINS), controller.listReports);

/**
 * @openapi
 * /admin/reports/{id}/review:
 *   patch:
 *     tags: [Admin]
 *     summary: Mark a report as reviewed or dismissed (admin only)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [reviewed, dismissed]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated
 *       404:
 *         description: Report not found
 */
router.patch('/reports/:id/review', authorize(...ALL_ADMINS), validate(validators.reviewReport), controller.reviewReport);

module.exports = router;
