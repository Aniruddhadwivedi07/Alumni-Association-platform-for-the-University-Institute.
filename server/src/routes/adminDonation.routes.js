'use strict';

const express = require('express');
const {
  getAdminDonations,
  getAdminDonationSummary
} = require('../controllers/donation.controller');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateQuery } = require('../middlewares/validate');
const { adminDonationQuerySchema } = require('../validators/donation.validator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All admin donation routes require authentication and ADMIN role
router.use(requireAuth);
router.use(authorizeRoles(ROLES.ADMIN));

// GET /api/admin/donations/summary - Statistical donation summary (ADMIN only)
router.get('/summary', getAdminDonationSummary);

// GET /api/admin/donations - Administrative overview with filters and pagination (ADMIN only)
router.get('/', validateQuery(adminDonationQuerySchema), getAdminDonations);

module.exports = router;

