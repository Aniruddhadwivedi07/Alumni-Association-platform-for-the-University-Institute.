'use strict';

const express = require('express');
const {
  createMentorshipRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  withdrawMentorshipRequest
} = require('../controllers/mentorship.controller');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  createMentorshipRequestSchema,
  mentorshipQuerySchema,
  updateMentorshipStatusSchema
} = require('../validators/mentorship.validator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All mentorship routes require authentication
router.use(requireAuth);

// POST /api/mentorship/requests - Create a mentorship request (STUDENT only)
router.post(
  '/requests',
  authorizeRoles(ROLES.STUDENT),
  validateBody(createMentorshipRequestSchema),
  createMentorshipRequest
);

// GET /api/mentorship/requests/received - View received requests (ALUMNI and ADMIN)
// Must be defined BEFORE /:requestId routes to avoid ambiguous matching
router.get(
  '/requests/received',
  authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN),
  validateQuery(mentorshipQuerySchema),
  getReceivedRequests
);

// GET /api/mentorship/requests/sent - View sent requests (STUDENT only)
router.get(
  '/requests/sent',
  authorizeRoles(ROLES.STUDENT),
  validateQuery(mentorshipQuerySchema),
  getSentRequests
);

// PATCH /api/mentorship/requests/:requestId/status - Update status (Mentor or ADMIN)
router.patch(
  '/requests/:requestId/status',
  authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN),
  validateBody(updateMentorshipStatusSchema),
  updateRequestStatus
);

// DELETE /api/mentorship/requests/:requestId - Withdraw request (STUDENT who created it)
router.delete(
  '/requests/:requestId',
  authorizeRoles(ROLES.STUDENT),
  withdrawMentorshipRequest
);

module.exports = router;

