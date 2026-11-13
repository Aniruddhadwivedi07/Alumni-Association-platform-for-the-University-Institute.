// Vercel serverless entry point.  The Express app owns all /api routes.
const { createApp } = require('../server/src/app');

module.exports = createApp();
