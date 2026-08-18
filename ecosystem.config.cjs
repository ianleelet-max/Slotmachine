module.exports = {
  apps: [
    {
      name: "auditreq-api",
      cwd: "/home/ian/AudiTREQ/packages/api",
      script: "dist/server.js",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      }
    },
    {
      name: "sursitrack-backend",
      cwd: "/home/ian/AudiTREQ/packages/sursitrack-backend",
      script: "dist/server.js",
      env: {
        PORT: 3002,
        NODE_ENV: "production"
      }
    },
    {
      name: "powai-ai-bridge",
      cwd: "/home/ian/AudiTREQ/packages/ai-engine",
      script: "dist/server.js",
      env: {
        PORT: 5055,
        NODE_ENV: "production",
        RUNPOD_ENDPOINT_ID: "minimax-h3-50k"
      }
    }
  ]
};