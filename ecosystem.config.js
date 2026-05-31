/**
 * ecosystem.config.js
 * PM2 process manager configuration.
 * Run with: pm2 start ecosystem.config.js
 *
 * NOTE: On t2.micro (1 vCPU), instances: 1. Do NOT use 'max' — it'll fork
 *       multiple processes but they'll all fight for the same single core.
 */

module.exports = {
  apps: [
    {
      name: 'riserank-backend',
      script: 'server.js',
      instances: 1,             // 1 on t2.micro, bump to 'max' on multi-core
      exec_mode: 'fork',        // Use 'cluster' only on multi-core instances
      watch: false,             // Never watch in production
      max_memory_restart: '400M', // Restart if memory exceeds 400MB

      // Environment: production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Environment: development (pm2 start ecosystem.config.js --env development)
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      // Log config
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,

      // Restart strategy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true,
    },
  ],
};
