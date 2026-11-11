'use strict';

const { z } = require('zod');

const MAX_PAGE_SIZE = 50;

/**
 * Query schema for GET /api/donations/campaigns
 */
const campaignQuerySchema = z
  .object({
    page: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'page must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .default(1),
    limit: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'limit must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .refine((v) => v <= MAX_PAGE_SIZE, {
        message: `Page size cannot exceed ${MAX_PAGE_SIZE}`
      })
      .default(10)
  })
  .strict();

/**
 * Body schema for POST /api/donations/campaigns/:campaignId/donate
 */
const initiateDonationSchema = z
  .object({
    amount: z
      .union([
        z.number().positive('Amount must be positive'),
        z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid positive number with at most 2 decimal places')
          .transform((v) => parseFloat(v))
      ])
      .refine((v) => typeof v === 'number' && !isNaN(v) && v > 0, {
        message: 'Amount must be greater than zero'
      })
  })
  .strict();

/**
 * Body schema for POST /api/donations/verify
 */
const verifyDonationSchema = z
  .object({
    razorpay_order_id: z.string().trim().min(1, 'razorpay_order_id is required'),
    razorpay_payment_id: z.string().trim().min(1, 'razorpay_payment_id is required'),
    razorpay_signature: z.string().trim().min(1, 'razorpay_signature is required'),
    transactionId: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'transactionId must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .optional()
  })
  .strict();

/**
 * Query schema for GET /api/donations/my-history
 */
const myDonationHistoryQuerySchema = z
  .object({
    page: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'page must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .default(1),
    limit: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'limit must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .refine((v) => v <= MAX_PAGE_SIZE, {
        message: `Page size cannot exceed ${MAX_PAGE_SIZE}`
      })
      .default(10)
  })
  .strict();

/**
 * Query schema for GET /api/admin/donations
 */
const adminDonationQuerySchema = z
  .object({
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional(),
    campaignId: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'campaignId must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .optional(),
    startDate: z
      .string()
      .datetime({ offset: true, message: 'startDate must be a valid ISO datetime' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD or ISO format'))
      .optional(),
    endDate: z
      .string()
      .datetime({ offset: true, message: 'endDate must be a valid ISO datetime' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD or ISO format'))
      .optional(),
    page: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'page must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .default(1),
    limit: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'limit must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .refine((v) => v <= MAX_PAGE_SIZE, {
        message: `Page size cannot exceed ${MAX_PAGE_SIZE}`
      })
      .default(10)
  })
  .strict();

module.exports = {
  campaignQuerySchema,
  initiateDonationSchema,
  verifyDonationSchema,
  myDonationHistoryQuerySchema,
  adminDonationQuerySchema,
  MAX_PAGE_SIZE
};

