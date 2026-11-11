const express = require('express');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const directoryRoutes = require('./routes/directory.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const eventRoutes = require('./routes/event.routes');
const mentorshipRoutes = require('./routes/mentorship.routes');
const donationRoutes = require('./routes/donation.routes');
const adminDonationRoutes = require('./routes/adminDonation.routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { sessionMiddleware } = require('./config/session');

function createApp() {
  const app = express();

  // If in production and behind a reverse proxy (e.g. Nginx/Render/Heroku), trust the first proxy hop
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf.toString();
      }
    })
  );

  // Register session middleware before routes that access it
  app.use(sessionMiddleware());

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

  // Profile routes
  app.use('/api/profile', profileRoutes);

  // Directory routes
  app.use('/api/directory', directoryRoutes);

  // Job routes
  app.use('/api/jobs', jobRoutes);

  // Application routes
  app.use('/api/applications', applicationRoutes);

  // Event routes
  app.use('/api/events', eventRoutes);

  // Mentorship routes
  app.use('/api/mentorship', mentorshipRoutes);

  // Donation routes
  app.use('/api/donations', donationRoutes);

  // Admin donation routes
  app.use('/api/admin/donations', adminDonationRoutes);

  // Centralized error handling
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
