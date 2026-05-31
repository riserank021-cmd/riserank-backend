/**
 * routes/index.js
 * Central route registry. All route files mount here.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const currentAffairRoutes = require('./currentAffair.routes');
const questionRoutes = require('./question.routes');
const quizRoutes = require('./quiz.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');
const uploadRoutes = require('./upload.routes');
const notificationRoutes = require('./notification.routes');
const importRoutes = require('./import.routes');

// ── Health check ──────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RiseRank API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ── App config (version gate) ─────────────────────────────────────────────────
// Mobile apps call this on launch to check if an update is required.
// Set MINIMUM_APP_VERSION and LATEST_APP_VERSION in your environment variables.
// Force-update: bump MINIMUM_APP_VERSION past the broken build's version.
// Soft-update:  bump LATEST_APP_VERSION whenever a new release ships.
router.get('/app/config', (req, res) => {
  res.json({
    success: true,
    data: {
      minimumVersion: process.env.MINIMUM_APP_VERSION ?? '1.0.0',
      latestVersion:  process.env.LATEST_APP_VERSION  ?? '1.0.0',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    },
  });
});

// ── Route mounts ──────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/current-affairs', currentAffairRoutes);
router.use('/questions', questionRoutes);
router.use('/quizzes', quizRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/import', importRoutes);

module.exports = router;
