const express = require('express');
const {
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication
} = require('../controllers/application.controller');
const { requireAuth } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  updateApplicationStatusSchema,
  applicationHistoryQuerySchema
} = require('../validators/application.validator');

const router = express.Router();

// All application routes require authentication
router.use(requireAuth);

// GET /api/applications/me - Get current user's job application history
router.get('/me', validateQuery(applicationHistoryQuerySchema), getMyApplications);

// GET /api/applications/:applicationId - Get application details
router.get('/:applicationId', getApplicationById);

// PATCH /api/applications/:applicationId/status - Update application status (Job Creator or ADMIN)
router.patch(
  '/:applicationId/status',
  validateBody(updateApplicationStatusSchema),
  updateApplicationStatus
);

// DELETE /api/applications/:applicationId - Withdraw application (Applicant only)
router.delete('/:applicationId', withdrawApplication);

module.exports = router;

