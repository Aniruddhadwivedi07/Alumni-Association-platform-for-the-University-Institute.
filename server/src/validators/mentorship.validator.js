'use strict';

const { z } = require('zod');

const MAX_PAGE_SIZE = 50;

/**
 * Body schema for POST /api/mentorship/requests
 * Student creates a request; studentId derived from session, status always PENDING.
 */
const createMentorshipRequestSchema = z
  .object({
    mentorId: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'mentorId must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .refine((v) => v > 0, { message: 'mentorId must be a positive integer' }),
    message: z.string().trim().max(1000, 'Message must be 1000 characters or fewer').optional()
  })
  .strict();

/**
 * Query schema for pagination + optional status filter.
 * Used by: GET received, GET sent.
 */
const mentorshipQuerySchema = z
  .object({
    status: z
      .enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'], {
        errorMap: () => ({
          message: 'status must be one of PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED'
        })
      })
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
      .refine((v) => v <= MAX_PAGE_SIZE, { message: `Page size cannot exceed ${MAX_PAGE_SIZE}` })
      .default(10)
  })
  .strict();

/**
 * Body schema for PATCH /api/mentorship/requests/:requestId/status
 */
const updateMentorshipStatusSchema = z
  .object({
    status: z.enum(['ACCEPTED', 'REJECTED', 'COMPLETED'], {
      errorMap: () => ({
        message: 'status must be one of ACCEPTED, REJECTED, COMPLETED'
      })
    })
  })
  .strict();

/**
 * Param schema for :requestId
 */
const requestIdParamSchema = z.object({
  requestId: z
    .string()
    .regex(/^[1-9]\d*$/, 'requestId must be a positive integer')
    .transform((v) => parseInt(v, 10))
});

module.exports = {
  createMentorshipRequestSchema,
  mentorshipQuerySchema,
  updateMentorshipStatusSchema,
  requestIdParamSchema,
  MAX_PAGE_SIZE
};

