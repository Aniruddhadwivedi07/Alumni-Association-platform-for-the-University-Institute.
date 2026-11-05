const express = require('express');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Alumni Association API Backend'
    });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'Alumni Association API'
    });
  });

  // Auth routes
  app.use('/api/auth', authRoutes);

  // Centralized error handling
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};

