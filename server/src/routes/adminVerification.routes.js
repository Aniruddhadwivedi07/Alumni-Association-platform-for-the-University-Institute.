const express = require('express');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const { ROLES } = require('../constants/roles');
const { adminVerifySchema } = require('../validators/verification.validator');
const { processAdminVerification } = require('../controllers/verification.controller');

const router = express.Router();

// Direct match for client call: POST /api/admin/alumni/:applicantId/verify
router.post(
  '/:applicantId/verify',
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validateBody(adminVerifySchema),
  processAdminVerification
);

module.exports = router;
