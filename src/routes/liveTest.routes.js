/**
 * liveTest.routes.js
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/liveTest.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { ROLES } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

// Public — list & detail (user sees upcoming/live/ended)
router.get('/', protect, ctrl.list);
router.get('/:id', protect, ctrl.getOne);
router.get('/:id/leaderboard', protect, ctrl.leaderboard);
router.get('/:id/stats', protect, ctrl.stats);

// Authenticated user actions
router.post('/:id/start', protect, ctrl.start);
router.post('/:id/submit', protect, ctrl.submit);

// Admin only
router.post('/', protect, authorize(...ADMIN_ROLES), ctrl.create);
router.patch('/:id', protect, authorize(...ADMIN_ROLES), ctrl.update);
router.patch('/:id/status', protect, authorize(...ADMIN_ROLES), ctrl.setStatus);
router.delete('/:id', protect, authorize(...ADMIN_ROLES), async (req, res) => {
  const LiveTest = require('../models/LiveTest');
  await LiveTest.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
