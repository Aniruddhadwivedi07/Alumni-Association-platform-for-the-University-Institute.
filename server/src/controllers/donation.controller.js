'use strict';

const crypto = require('crypto');
const { Prisma } = require('@prisma/client');
const prisma = require('../prisma');
const { getRazorpayInstance } = require('../config/razorpay');

/**
 * Helper: Constant-time signature comparison using crypto.timingSafeEqual
 */
function verifySignature(expectedSignature, receivedSignature) {
  if (typeof expectedSignature !== 'string' || typeof receivedSignature !== 'string') {
    return false;
  }
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * GET /api/donations/campaigns
 * List active campaigns with pagination (Public)
 */
async function getCampaigns(req, res, next) {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true
    };

    const [totalRecords, campaigns] = await Promise.all([
      prisma.donationCampaign.count({ where }),
      prisma.donationCampaign.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          targetAmount: true,
          currency: true,
          startDate: true,
          endDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return res.status(200).json({
      success: true,
      data: campaigns.map((c) => ({
        ...c,
        targetAmount: c.targetAmount.toString()
      })),
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/donations/campaigns/:campaignId
 * Get details of an active campaign including raised amount (from status=SUCCESS only)
 */
async function getCampaignById(req, res, next) {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    if (isNaN(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid campaign ID format'
        }
      });
    }

    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        description: true,
        targetAmount: true,
        currency: true,
        startDate: true,
        endDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!campaign || !campaign.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found or is inactive'
        }
      });
    }

    // Calculate raised amount using Prisma aggregate on SUCCESS transactions
    const aggregate = await prisma.donationTransaction.aggregate({
      where: {
        campaignId,
        status: 'SUCCESS'
      },
      _sum: {
        amount: true
      }
    });

    const raisedAmount = aggregate._sum.amount
      ? aggregate._sum.amount.toString()
      : '0.00';

    return res.status(200).json({
      success: true,
      data: {
        ...campaign,
        targetAmount: campaign.targetAmount.toString(),
        raisedAmount
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/donations/campaigns/:campaignId/donate
 * Initiate donation & create Razorpay order
 * Allowed: Authenticated user
 */
async function initiateDonation(req, res, next) {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    if (isNaN(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid campaign ID format'
        }
      });
    }

    const { amount } = req.body;
    const donorId = req.user.id;

    // Verify campaign exists, is active, and has not ended
    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign || !campaign.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found or is inactive'
        }
      });
    }

    const now = new Date();
    if (campaign.endDate && now > new Date(campaign.endDate)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Cannot donate: Campaign has already ended'
        }
      });
    }

    if (now < new Date(campaign.startDate)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Cannot donate: Campaign has not started yet'
        }
      });
    }

    // Decimal amount format
    const decimalAmount = new Prisma.Decimal(amount.toFixed(2));
    const smallestCurrencyUnitAmount = Math.round(amount * 100);

    const razorpay = getRazorpayInstance();
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!razorpay || !keyId) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'PAYMENT_GATEWAY_UNAVAILABLE',
          message: 'Payment gateway configuration is missing or unavailable'
        }
      });
    }

    // 1. Create local transaction first in PENDING status
    const initialTx = await prisma.donationTransaction.create({
      data: {
        campaignId,
        donorId,
        amount: decimalAmount,
        currency: campaign.currency,
        status: 'PENDING',
        paymentProvider: 'RAZORPAY'
      }
    });

    // 2. Generate unique receipt identifier
    const receipt = `rcpt_${initialTx.id}_${Date.now().toString().slice(-8)}`;

    // 3. Create Razorpay order
    let order;
    try {
      order = await razorpay.orders.create({
        amount: smallestCurrencyUnitAmount,
        currency: campaign.currency,
        receipt,
        notes: {
          transactionId: initialTx.id.toString(),
          campaignId: campaignId.toString(),
          donorId: donorId.toString()
        }
      });
    } catch (gatewayError) {
      // If gateway creation fails, clean up or mark transaction failed safely
      await prisma.donationTransaction.update({
        where: { id: initialTx.id },
        data: { status: 'FAILED' }
      });

      return res.status(502).json({
        success: false,
        error: {
          code: 'PAYMENT_GATEWAY_ERROR',
          message: 'Failed to create order with payment gateway'
        }
      });
    }

    // 4. Update transaction with providerOrderId
    const updatedTx = await prisma.donationTransaction.update({
      where: { id: initialTx.id },
      data: {
        providerOrderId: order.id
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Donation order initiated successfully',
      data: {
        transactionId: updatedTx.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/donations/verify
 * Server-side payment verification using Razorpay HMAC SHA256 signature
 * Allowed: Authenticated donor
 */
async function verifyDonation(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId
    } = req.body;
    const currentUserId = req.user.id;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'PAYMENT_GATEWAY_UNAVAILABLE',
          message: 'Payment gateway configuration is missing or unavailable'
        }
      });
    }

    // 1. Look up the transaction by providerOrderId (or transactionId)
    const whereClause = transactionId
      ? { id: transactionId }
      : { providerOrderId: razorpay_order_id };

    const transaction = await prisma.donationTransaction.findFirst({
      where: whereClause,
      include: {
        campaign: true
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Donation transaction not found'
        }
      });
    }

    // 2. Verify ownership: must belong to the authenticated user
    if (transaction.donorId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You cannot verify a transaction belonging to another user'
        }
      });
    }

    // 3. Confirm order ID matches the stored transaction
    if (transaction.providerOrderId && transaction.providerOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Order ID mismatch with stored transaction'
        }
      });
    }

    // 4. Server-side HMAC SHA256 signature verification
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = verifySignature(generatedSignature, razorpay_signature);

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Payment signature verification failed'
        }
      });
    }

    // 5. Check if providerPaymentId has already been used by ANOTHER transaction
    const existingPaymentTx = await prisma.donationTransaction.findUnique({
      where: { providerPaymentId: razorpay_payment_id }
    });

    if (existingPaymentTx && existingPaymentTx.id !== transaction.id) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Payment ID has already been recorded for another transaction'
        }
      });
    }

    // 6. Idempotency: If already SUCCESS, return success response without re-processing
    if (transaction.status === 'SUCCESS') {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been verified successfully',
        data: {
          transactionId: transaction.id,
          campaignId: transaction.campaignId,
          amount: transaction.amount.toString(),
          currency: transaction.currency,
          status: 'SUCCESS',
          paymentId: transaction.providerPaymentId
        }
      });
    }

    // 7. Update transaction to SUCCESS
    const updatedTx = await prisma.donationTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'SUCCESS',
        providerOrderId: razorpay_order_id,
        providerPaymentId: razorpay_payment_id
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        transactionId: updatedTx.id,
        campaignId: updatedTx.campaignId,
        amount: updatedTx.amount.toString(),
        currency: updatedTx.currency,
        status: updatedTx.status,
        paymentId: updatedTx.providerPaymentId
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/donations/webhook
 * Razorpay webhook handler for asynchronous payment lifecycle events
 */
async function handleWebhook(req, res, next) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'WEBHOOK_UNCONFIGURED',
          message: 'Webhook secret is not configured on the server'
        }
      });
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Missing x-razorpay-signature header'
        }
      });
    }

    // Verify signature using the exact raw body
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!verifySignature(expectedSignature, signature)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_SIGNATURE',
          message: 'Webhook signature verification failed'
        }
      });
    }

    const event = req.body;
    const eventType = event.event;

    // Handle payment.captured or order.paid
    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return res.status(200).json({ status: 'ignored_missing_entity' });
      }

      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amountInPaise = payment.amount;
      const currency = payment.currency;

      if (!orderId) {
        return res.status(200).json({ status: 'ignored_missing_order_id' });
      }

      const transaction = await prisma.donationTransaction.findFirst({
        where: { providerOrderId: orderId }
      });

      if (!transaction) {
        return res.status(200).json({ status: 'transaction_not_found' });
      }

      // Check if payment ID is already assigned to a DIFFERENT transaction
      const existingPayment = await prisma.donationTransaction.findUnique({
        where: { providerPaymentId: paymentId }
      });

      if (existingPayment && existingPayment.id !== transaction.id) {
        return res.status(200).json({ status: 'payment_id_conflict' });
      }

      // Verify amount and currency
      const expectedAmountInSmallestUnit = Math.round(parseFloat(transaction.amount.toString()) * 100);
      if (
        amountInPaise !== expectedAmountInSmallestUnit ||
        currency.toUpperCase() !== transaction.currency.toUpperCase()
      ) {
        return res.status(200).json({ status: 'amount_or_currency_mismatch' });
      }

      // Idempotent: If already SUCCESS, do not update again
      if (transaction.status === 'SUCCESS') {
        return res.status(200).json({ status: 'already_processed' });
      }

      await prisma.donationTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS',
          providerPaymentId: paymentId
        }
      });

      return res.status(200).json({ status: 'success' });
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (!payment || !payment.order_id) {
        return res.status(200).json({ status: 'ignored' });
      }

      const transaction = await prisma.donationTransaction.findFirst({
        where: { providerOrderId: payment.order_id }
      });

      if (!transaction) {
        return res.status(200).json({ status: 'transaction_not_found' });
      }

      // Do NOT overwrite an already SUCCESS payment with FAILED
      if (transaction.status === 'SUCCESS') {
        return res.status(200).json({ status: 'already_successful_preserved' });
      }

      await prisma.donationTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          providerPaymentId: payment.id || transaction.providerPaymentId
        }
      });

      return res.status(200).json({ status: 'marked_failed' });
    }

    // Default acknowledgement for other unhandled events
    return res.status(200).json({ status: 'acknowledged' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCampaigns,
  getCampaignById,
  initiateDonation,
  verifyDonation,
  handleWebhook
};

