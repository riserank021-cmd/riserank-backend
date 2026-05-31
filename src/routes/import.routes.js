/**
 * import.routes.js
 * Bulk question import from CSV.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/import.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { ROLES } = require('../config/constants');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

// CSV-specific multer config (memory storage, 2MB max, csv only)
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

/**
 * @openapi
 * /import/template:
 *   get:
 *     tags: [Import]
 *     summary: Download blank CSV import template (admin only)
 *     description: Returns a CSV file with all 19 required columns and one sample row.
 *     responses:
 *       200:
 *         description: CSV template file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/template', protect, authorize(...ADMIN_ROLES), controller.downloadTemplate);

/**
 * @openapi
 * /import/questions:
 *   post:
 *     tags: [Import]
 *     summary: Bulk import questions from a CSV file (admin only)
 *     description: |
 *       Upload a CSV with up to 500 rows. All rows are validated before any DB insert —
 *       if any row has errors the entire import is aborted. All imported questions are
 *       created as **DRAFT** status.
 *
 *       Required CSV columns (19 total):
 *       `questionText_en`, `questionText_hi`, `optionA_en`, `optionA_hi`,
 *       `optionB_en`, `optionB_hi`, `optionC_en`, `optionC_hi`,
 *       `optionD_en`, `optionD_hi`, `correctOption`, `explanation_en`,
 *       `explanation_hi`, `examCategory`, `subject`, `topic`, `difficulty`, `year`
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file (max 2MB, max 500 rows)
 *     responses:
 *       200:
 *         description: Import result
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
 *                         total:
 *                           type: integer
 *                           example: 50
 *                         imported:
 *                           type: integer
 *                           example: 50
 *                         status:
 *                           type: string
 *                           example: success
 *       400:
 *         description: Validation errors in CSV rows
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         rowErrors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               row:
 *                                 type: integer
 *                               errors:
 *                                 type: array
 *                                 items:
 *                                   type: string
 */
router.post(
  '/questions',
  protect,
  authorize(...ADMIN_ROLES),
  csvUpload.single('file'),
  controller.importQuestions
);

module.exports = router;
