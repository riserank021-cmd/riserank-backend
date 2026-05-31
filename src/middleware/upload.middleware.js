/**
 * upload.middleware.js
 * Multer configuration for file uploads.
 * Files are stored in memory (buffer), then pushed to S3 in the controller.
 * Max size: 5MB. Allowed types: JPEG, PNG, WebP.
 */

const multer = require('multer');
const { sendBadRequest } = require('../utils/apiResponse');

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

// ── Memory storage (buffer → S3) ──────────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

// ── Error handler wrapper for multer ─────────────────────────────────────────
const handleUploadError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendBadRequest(res, `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      }
      return sendBadRequest(res, err.message);
    }
    if (err) {
      return sendBadRequest(res, err.message);
    }
    next();
  });
};

// ── Export pre-configured middlewares ─────────────────────────────────────────
const uploadSingle = (fieldName) => handleUploadError(upload.single(fieldName));
const uploadMultiple = (fieldName, maxCount = 5) =>
  handleUploadError(upload.array(fieldName, maxCount));

module.exports = { uploadSingle, uploadMultiple };
