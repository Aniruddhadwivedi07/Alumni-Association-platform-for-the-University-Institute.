'use strict';

const express = require('express');
const {
  getCampaigns,
  getCampaignById,
  initiateDonation,
  verifyDonation,
  handleWebhook
} = require('../controllers/donation.controller');
const { requireAuth } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  campaignQuerySchema,
  initiateDonationSchema,
  verifyDonationSchema
} = require('../validators/donation.validator');

const router = express.Router();

// GET /api/donations/campaigns - Public listing of active campaigns
router.get('/campaigns', validateQuery(campaignQuerySchema), getCampaigns);

// GET /api/donations/campaigns/:campaignId - Public details of campaign with raised amount
router.get('/campaigns/:campaignId', getCampaignById);

// POST /api/donations/campaigns/:campaignId/donate - Initiate donation (Requires Auth)
router.post(
  '/campaigns/:campaignId/donate',
  requireAuth,
  validateBody(initiateDonationSchema),
  initiateDonation
);

// POST /api/donations/verify - Server-side payment verification (Requires Auth)
router.post(
  '/verify',
  requireAuth,
  validateBody(verifyDonationSchema),
  verifyDonation
);

// POST /api/donations/webhook - Razorpay webhook endpoint (Public, signature-verified)
router.post('/webhook', handleWebhook);

module.exports = router;

