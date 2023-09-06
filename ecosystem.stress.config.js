/**
 * @description pm2 configuration file.
 */

module.exports = {
  apps: [
    {
      name: 'stress', // pm2 start App name
      script: 'dist/server.js',
      exec_mode: 'cluster', // 'cluster' or 'fork'
      instance_var: 'INSTANCE_ID', // instance variable
      instances: 2, // pm2 instance count
      autorestart: true, // auto restart if process crash
      watch: false, // files change automatic restart
      ignore_watch: ['node_modules', 'logs'], // ignore files change
      max_memory_restart: '1G', // restart if process use more than 1G memory
      merge_logs: true, // if true, stdout and stderr will be merged and sent to pm2 log
      output: './logs/stress/access.log', // pm2 log file
      error: './logs/stress/error.log', // pm2 error log file
      env: {
        // environment variable
        NODE_ENV: 'stress',
        PORT: 3001
      }
    }
  ]
};
