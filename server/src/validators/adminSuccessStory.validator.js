'use strict';

const { z } = require('zod');

const MAX_PAGE_SIZE = 50;

/**
 * Query schema for GET /api/admin/success-stories
 */
const adminStoryQuerySchema = z
  .object({
    status: z.enum(['published', 'unpublished']).optional(),
    authorId: z
      .union([
        z.number().int().positive(),
        z
          .string()
          .regex(/^[1-9]\d*$/, 'authorId must be a positive integer')
          .transform((v) => parseInt(v, 10))
      ])
      .optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(['createdAt', 'publishedAt', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
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
  adminStoryQuerySchema,
  MAX_PAGE_SIZE
};

