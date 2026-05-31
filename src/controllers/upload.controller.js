/**
 * upload.controller.js
 * Handles file uploads — avatar and current-affairs images.
 * File arrives as req.file (buffer) via multer memory storage,
 * gets pushed to S3, and the resulting URL is saved to the document.
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { uploadToS3, deleteFromS3 } = require('../services/s3.service');
const User = require('../models/User');
const CurrentAffair = require('../models/CurrentAffair');

// ── Upload user avatar ────────────────────────────────────────────────────────
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const user = await User.findById(req.user._id);

  // Delete old avatar from S3 if exists
  if (user.avatar) {
    deleteFromS3(user.avatar).catch(() => {}); // Non-blocking
  }

  const url = await uploadToS3(
    req.file.buffer,
    req.file.originalname,
    'avatars',
    req.file.mimetype
  );

  user.avatar = url;
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, {
    message: 'Avatar uploaded successfully',
    data: { url },
  });
});

// ── Upload current affairs image ──────────────────────────────────────────────
const uploadCurrentAffairImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const affair = await CurrentAffair.findById(req.params.id);
  if (!affair) throw new AppError('Current affair not found', 404);

  // Delete old image if exists
  if (affair.imageUrl) {
    deleteFromS3(affair.imageUrl).catch(() => {});
  }

  const url = await uploadToS3(
    req.file.buffer,
    req.file.originalname,
    'current-affairs',
    req.file.mimetype
  );

  affair.imageUrl = url;
  affair.updatedBy = req.user._id;
  await affair.save();

  return sendSuccess(res, {
    message: 'Image uploaded successfully',
    data: { imageUrl: url },
  });
});

module.exports = { uploadAvatar, uploadCurrentAffairImage };
