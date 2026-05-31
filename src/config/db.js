/**
 * db.js
 * MongoDB Atlas connection with retry logic and event logging.
 * Called once in server.js before app.listen().
 */

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const MONGO_OPTIONS = {
  maxPoolSize: 10,          // Max concurrent connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,                // Use IPv4, skip IPv6 trial
};

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, MONGO_OPTIONS);
    retryCount = 0;
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    retryCount += 1;
    logger.error(`MongoDB connection error (attempt ${retryCount}): ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      logger.error('Max MongoDB connection retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown — close DB on process exit
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Closing MongoDB connection...`);
  await mongoose.connection.close();
  logger.info('MongoDB connection closed. Exiting.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
