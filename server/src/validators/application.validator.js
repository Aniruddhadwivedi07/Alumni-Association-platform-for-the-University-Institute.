const { z } = require('zod');

const APPLICATION_STATUSES = [
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'REJECTED',
  'ACCEPTED'
];

const ALL_APPLICATION_STATUSES = [
  ...APPLICATION_STATUSES,
  'WITHDRAWN'
];

const MAX_PAGE_SIZE = 50;

// Schema for POST /api/jobs/:jobId/applications
const createApplicationSchema = z
  .object({
    coverLetter: z
      .string({
        invalid_type_error: 'Cover letter must be a string'
      })
      .trim()
      .max(5000, 'Cover letter cannot exceed 5000 characters')
      .optional()
      .nullable(),
    resumeUrl: z
      .string({
        invalid_type_error: 'Resume URL must be a string'
      })
      .trim()
      .url('Resume URL must be a valid URL')
      .max(500, 'Resume URL cannot exceed 500 characters')
      .optional()
      .nullable()
  })
  .strict();

// Schema for PATCH /api/applications/:applicationId/status
const updateApplicationStatusSchema = z
  .object({
    status: z
      .string({
        required_error: 'Status is required',
        invalid_type_error: 'Status must be a string'
      })
      .trim()
      .refine((val) => APPLICATION_STATUSES.includes(val), {
        message: `Status must be one of: ${APPLICATION_STATUSES.join(', ')}`
      })
  })
  .strict();

// Schema for GET /api/applications/me query parameters
const applicationHistoryQuerySchema = z
  .object({
    page: z
      .union([
        z.number().int().positive(),
        z.string().regex(/^[1-9]\d*$/, 'Page must be a positive integer').transform((val) => parseInt(val, 10))
      ])
      .default(1),
    limit: z
      .union([
        z.number().int().positive(),
        z.string().regex(/^[1-9]\d*$/, 'Limit must be a positive integer').transform((val) => parseInt(val, 10))
      ])
      .refine((val) => val <= MAX_PAGE_SIZE, {
        message: `Page size cannot exceed ${MAX_PAGE_SIZE}`
      })
      .default(10)
  })
  .strict();

module.exports = {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationHistoryQuerySchema,
  APPLICATION_STATUSES,
  ALL_APPLICATION_STATUSES,
  MAX_PAGE_SIZE
};

