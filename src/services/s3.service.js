/**
 * s3.service.js
 * AWS S3 upload service.
 * Handles image uploads for current affairs and user avatars.
 * Falls back to a no-op warning if S3 is not configured (MVP dev mode).
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const env = require('../config/env');
const logger = require('../utils/logger');

// ── S3 Client ─────────────────────────────────────────────────────────────────
const getS3Client = () => {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

// ── Upload to S3 ──────────────────────────────────────────────────────────────
/**
 * @param {Buffer} fileBuffer - file data
 * @param {string} originalName - original file name (for extension)
 * @param {string} folder - S3 folder prefix e.g. 'avatars' | 'current-affairs'
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<string>} - public URL of uploaded file
 */
const uploadToS3 = async (fileBuffer, originalName, folder, mimeType) => {
  const s3 = getS3Client();

  if (!s3 || !env.AWS_S3_BUCKET) {
    logger.warn('S3 not configured — skipping upload');
    return null;
  }

  const ext = path.extname(originalName).toLowerCase();
  const fileName = `${folder}/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    // Public read — images are public (no signed URLs needed for static content)
    ACL: 'public-read',
  });

  await s3.send(command);

  const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
  logger.info(`File uploaded to S3: ${url}`);
  return url;
};

// ── Delete from S3 ────────────────────────────────────────────────────────────
/**
 * @param {string} fileUrl - full S3 URL of the file to delete
 */
const deleteFromS3 = async (fileUrl) => {
  const s3 = getS3Client();
  if (!s3 || !env.AWS_S3_BUCKET || !fileUrl) return;

  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.replace(/^\//, '');

    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3.send(command);
    logger.info(`File deleted from S3: ${key}`);
  } catch (err) {
    logger.error(`S3 delete failed: ${err.message}`);
  }
};

module.exports = { uploadToS3, deleteFromS3 };
