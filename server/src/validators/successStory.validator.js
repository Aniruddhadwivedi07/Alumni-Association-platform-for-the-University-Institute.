'use strict';

const { z } = require('zod');

const MAX_PAGE_SIZE = 50;

/**
 * Body schema for POST /api/success-stories
 */
const createSuccessStorySchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters'),
    content: z
      .string({ required_error: 'Content is required' })
      .trim()
      .min(1, 'Content cannot be empty')
      .max(10000, 'Content cannot exceed 10000 characters'),
    imageUrl: z
      .string()
      .trim()
      .url('imageUrl must be a valid URL')
      .regex(/^https?:\/\//, 'imageUrl must use http or https protocol')
      .optional()
      .nullable()
  })
  .strict();

/**
 * Body schema for PUT /api/success-stories/:storyId
 */
const updateSuccessStorySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    content: z
      .string()
      .trim()
      .min(1, 'Content cannot be empty')
      .max(10000, 'Content cannot exceed 10000 characters')
      .optional(),
    imageUrl: z
      .string()
      .trim()
      .url('imageUrl must be a valid URL')
      .regex(/^https?:\/\//, 'imageUrl must use http or https protocol')
      .optional()
      .nullable()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (title, content, imageUrl) must be provided for update'
  });

/**
 * Query schema for GET /api/success-stories (Public listing)
 */
const publicStoryQuerySchema = z
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
      .default(10),
    search: z.string().trim().optional(),
    sortBy: z.enum(['publishedAt', 'createdAt']).default('publishedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
  .strict();

/**
 * Query schema for GET /api/success-stories/my
 */
const myStoryQuerySchema = z
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

module.exports = {
  createSuccessStorySchema,
  updateSuccessStorySchema,
  publicStoryQuerySchema,
  myStoryQuerySchema,
  MAX_PAGE_SIZE
};

