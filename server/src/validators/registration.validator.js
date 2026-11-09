const { z } = require('zod');

const MAX_PAGE_SIZE = 50;

// Schema for pagination queries (used in /my-registrations and /attendees)
const registrationPaginationQuerySchema = z
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
  registrationPaginationQuerySchema,
  MAX_PAGE_SIZE
};

