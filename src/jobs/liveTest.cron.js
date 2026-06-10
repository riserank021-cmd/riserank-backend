/**
 * liveTest.cron.js
 * Runs every minute to auto-transition live test statuses:
 *   upcoming → live  (when scheduledAt is reached)
 *   live     → ended (when scheduledAt + durationSeconds is reached)
 */

const cron = require('node-cron');
const { autoTransitionStatuses } = require('../services/liveTest.service');
const logger = require('../utils/logger');

const scheduleLiveTestTransitions = () => {
  // Every minute
  cron.schedule('* * * * *', async () => {
    try {
      await autoTransitionStatuses();
    } catch (err) {
      logger.error(`[LiveTest] Status transition failed: ${err.message}`);
    }
  });

  logger.info('[LiveTest] Status transition cron scheduled (every minute)');
};

module.exports = { scheduleLiveTestTransitions };
