const { z } = require('zod');

const ALLOWED_SORT_FIELDS = ['fullName', 'graduationYear', 'currentCompany'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_PAGE_SIZE = 50;

const directoryQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    graduationYear: z
      .union([
        z.number().int('Graduation year must be an integer'),
        z.string().regex(/^\d+$/, 'Graduation year must be a positive integer').transform((val) => parseInt(val, 10))
      ])
      .refine((val) => val >= 1950 && val <= 2100, {
        message: 'Graduation year must be between 1950 and 2100'
      })
      .optional(),
    department: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    company: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
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
      .default(10),
    sortBy: z
      .string()
      .trim()
      .refine((val) => ALLOWED_SORT_FIELDS.includes(val), {
        message: `sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}`
      })
      .default('fullName'),
    sortOrder: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => ALLOWED_SORT_ORDERS.includes(val), {
        message: `sortOrder must be one of: ${ALLOWED_SORT_ORDERS.join(', ')}`
      })
      .default('asc')
  })
  .strict();

module.exports = {
  directoryQuerySchema,
  ALLOWED_SORT_FIELDS,
  ALLOWED_SORT_ORDERS,
  MAX_PAGE_SIZE
};
