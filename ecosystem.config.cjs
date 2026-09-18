module.exports = {
  apps: [
    {
      name: 'ht-pf-production',
      script: 'server.js',
      cwd: 'E:\\websites\\proposalmaker\\HT-PF',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
