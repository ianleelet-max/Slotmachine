module.exports = {
  apps: [
    {
      name: 'auditreq-api',
      cwd: '/home/ian/AudiTREQ/packages/api',
      script: 'dist/index.js',
      env: {
        DATABASE_URL: 'postgres://postgres:auditreq_pass@localhost/auditreq',
        HOTE: '0.0.0.0',
        PORT: 3001
      }
    },
    {
      name: 'sursitrack-backend',
      cwd: '/home/ian/AudiTREQ/packages/sursitrack-backend',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
