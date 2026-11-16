const express = require('express');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const { ROLES } = require('../constants/roles');
const {
  adminVerifySchema,
  publicVerifyQuerySchema
} = require('../validators/verification.validator');
const {
  processAdminVerification,
  publicVerifyAlumni
} = require('../controllers/verification.controller');

const router = express.Router();

// Public verification endpoint: GET /api/verification/verify?code=ALU-000043
router.get(
  '/verify',
  validateQuery(publicVerifyQuerySchema),
  publicVerifyAlumni
);

// Admin verification action: POST /api/admin/alumni/:applicantId/verify
// Also routeable via /api/verification/admin/:applicantId if needed
router.post(
  '/admin/:applicantId/verify',
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validateBody(adminVerifySchema),
  processAdminVerification
);

module.exports = router;
