// PM2 runtime configuration, used only by the production Docker image.
//
// "cluster" mode with "max" instances forks one Node process per CPU core so
// the API can use every core without a reverse proxy. PM2 load-balances
// connections across the workers automatically.
//
// Scheduled jobs and the startup cache rebuild run only on instance "0" (see
// src/server.ts) so they are not executed once per worker.
module.exports = {
  apps: [
    {
      name: "birthdays-api",
      script: "dist/server.js",
      exec_mode: "cluster",
      instances: "max"
    }
  ]
};
