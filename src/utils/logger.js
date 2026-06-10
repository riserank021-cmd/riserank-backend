/**
 * logger.js
 * Winston logger with daily rotating files.
 * In production: logs to files. In development: logs to console.
 */

const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const env = require('../config/env');

const { combine, timestamp, printf, colorize, errors, json } = format;

// Custom format for console
const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

// Daily rotate transport config factory
const makeRotateTransport = (level, filename) =>
  new DailyRotateFile({
    filename: path.join(env.LOG_DIR || 'logs', `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d', // Keep 14 days
    level,
  });

const logger = createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'riserank-backend' },
  transports: [
    makeRotateTransport('error', 'error'),
    makeRotateTransport('info', 'combined'),
  ],
  exitOnError: false,
});

// Add console transport in development
if (env.isDevelopment) {
  logger.add(
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
    })
  );
}

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
