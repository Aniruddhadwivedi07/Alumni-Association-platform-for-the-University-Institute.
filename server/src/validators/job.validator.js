const { z } = require('zod');

const ALLOWED_JOB_SORT_FIELDS = ['createdAt', 'title', 'applicationDeadline'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_PAGE_SIZE = 50;

// Schema for POST /api/jobs
const createJobSchema = z
  .object({
    title: z
      .string({
        required_error: 'Title is required',
        invalid_type_error: 'Title must be a string'
      })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string'
      })
      .trim()
      .min(1, 'Description cannot be empty'),
    company: z
      .string({
        required_error: 'Company is required',
        invalid_type_error: 'Company must be a string'
      })
      .trim()
      .min(1, 'Company cannot be empty')
      .max(100, 'Company cannot exceed 100 characters'),
    location: z
      .string({
        invalid_type_error: 'Location must be a string'
      })
      .trim()
      .max(100, 'Location cannot exceed 100 characters')
      .optional()
      .nullable(),
    employmentType: z
      .string({
        required_error: 'Employment type is required',
        invalid_type_error: 'Employment type must be a string'
      })
      .trim()
      .min(1, 'Employment type cannot be empty')
      .max(50, 'Employment type cannot exceed 50 characters'),
    experienceLevel: z
      .string({
        invalid_type_error: 'Experience level must be a string'
      })
      .trim()
      .max(50, 'Experience level cannot exceed 50 characters')
      .optional()
      .nullable(),
    salaryMin: z
      .union([
        z.number().int('salaryMin must be an integer').nonnegative('salaryMin must be non-negative'),
        z.string().regex(/^\d+$/, 'salaryMin must be a non-negative integer').transform((val) => parseInt(val, 10))
      ])
      .optional()
      .nullable(),
    salaryMax: z
      .union([
        z.number().int('salaryMax must be an integer').nonnegative('salaryMax must be non-negative'),
        z.string().regex(/^\d+$/, 'salaryMax must be a non-negative integer').transform((val) => parseInt(val, 10))
      ])
      .optional()
      .nullable(),
    applicationDeadline: z
      .union([
        z.string().datetime({ message: 'applicationDeadline must be a valid ISO date string' }),
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'applicationDeadline must be YYYY-MM-DD or ISO date format')
      ])
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), {
        message: 'applicationDeadline must be a valid date'
      })
      .optional()
      .nullable()
  })
  .strict()
  .refine(
    (data) => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: 'salaryMin cannot exceed salaryMax',
      path: ['salaryMin']
    }
  );

// Schema for PUT /api/jobs/:jobId
const updateJobSchema = z
  .object({
    title: z
      .string({
        invalid_type_error: 'Title must be a string'
      })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    description: z
      .string({
        invalid_type_error: 'Description must be a string'
      })
      .trim()
      .min(1, 'Description cannot be empty')
      .optional(),
    company: z
      .string({
        invalid_type_error: 'Company must be a string'
      })
      .trim()
      .min(1, 'Company cannot be empty')
      .max(100, 'Company cannot exceed 100 characters')
      .optional(),
    location: z
      .string({
        invalid_type_error: 'Location must be a string'
      })
      .trim()
      .max(100, 'Location cannot exceed 100 characters')
      .optional()
      .nullable(),
    employmentType: z
      .string({
        invalid_type_error: 'Employment type must be a string'
      })
      .trim()
      .min(1, 'Employment type cannot be empty')
      .max(50, 'Employment type cannot exceed 50 characters')
      .optional(),
    experienceLevel: z
      .string({
        invalid_type_error: 'Experience level must be a string'
      })
      .trim()
      .max(50, 'Experience level cannot exceed 50 characters')
      .optional()
      .nullable(),
    salaryMin: z
      .union([
        z.number().int('salaryMin must be an integer').nonnegative('salaryMin must be non-negative'),
        z.string().regex(/^\d+$/, 'salaryMin must be a non-negative integer').transform((val) => parseInt(val, 10))
      ])
      .optional()
      .nullable(),
    salaryMax: z
      .union([
        z.number().int('salaryMax must be an integer').nonnegative('salaryMax must be non-negative'),
        z.string().regex(/^\d+$/, 'salaryMax must be a non-negative integer').transform((val) => parseInt(val, 10))
      ])
      .optional()
      .nullable(),
    applicationDeadline: z
      .union([
        z.string().datetime({ message: 'applicationDeadline must be a valid ISO date string' }),
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'applicationDeadline must be YYYY-MM-DD or ISO date format')
      ])
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), {
        message: 'applicationDeadline must be a valid date'
      })
      .optional()
      .nullable()
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided for update'
    }
  )
  .refine(
    (data) => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: 'salaryMin cannot exceed salaryMax',
      path: ['salaryMin']
    }
  );

// Schema for GET /api/jobs query parameters
const jobQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    location: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    employmentType: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    experienceLevel: z
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
      .refine((val) => ALLOWED_JOB_SORT_FIELDS.includes(val), {
        message: `sortBy must be one of: ${ALLOWED_JOB_SORT_FIELDS.join(', ')}`
      })
      .default('createdAt'),
    sortOrder: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => ALLOWED_SORT_ORDERS.includes(val), {
        message: `sortOrder must be one of: ${ALLOWED_SORT_ORDERS.join(', ')}`
      })
      .default('desc')
  })
  .strict();

module.exports = {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
  ALLOWED_JOB_SORT_FIELDS,
  ALLOWED_SORT_ORDERS,
  MAX_PAGE_SIZE
};

