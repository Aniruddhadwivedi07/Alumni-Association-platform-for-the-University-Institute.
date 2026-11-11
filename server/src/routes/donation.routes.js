'use strict';

const express = require('express');
const {
  getCampaigns,
  getCampaignById,
  initiateDonation,
  verifyDonation,
  handleWebhook,
  getMyDonationHistory,
  getTransactionById,
  downloadReceipt
} = require('../controllers/donation.controller');
const { requireAuth } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  campaignQuerySchema,
  initiateDonationSchema,
  verifyDonationSchema,
  myDonationHistoryQuerySchema
} = require('../validators/donation.validator');

const router = express.Router();

// GET /api/donations/my-history - Donor donation history (Requires Auth)
router.get(
  '/my-history',
  requireAuth,
  validateQuery(myDonationHistoryQuerySchema),
  getMyDonationHistory
);

// GET /api/donations/transactions/:transactionId/receipt - Download PDF receipt (Donor or ADMIN)
router.get('/transactions/:transactionId/receipt', requireAuth, downloadReceipt);

// GET /api/donations/transactions/:transactionId - Transaction details (Donor or ADMIN)
router.get('/transactions/:transactionId', requireAuth, getTransactionById);

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

