require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'htp-app',
      exec_mode: 'cluster',
      instances: '1',
      script: './.output/server/index.mjs', 
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ]
}