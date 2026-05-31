/**
 * server.js
 * Entry point. Loads env, connects DB, starts server.
 * PM2 and Docker both point to this file.
 */

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const initJobs = require('./src/jobs');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start background cron jobs
    initJobs();

    // 3. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`RiseRank backend running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds if server hasn't closed
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ── Unhandled Errors ───────────────────────────────────────────────────────
    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      gracefulShutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      gracefulShutdown('uncaughtException');
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
