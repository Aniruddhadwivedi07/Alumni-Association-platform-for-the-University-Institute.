const { z } = require('zod');

const ALLOWED_EVENT_SORT_FIELDS = ['startDate', 'createdAt', 'title'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_PAGE_SIZE = 50;

// Helper to validate and transform ISO or YYYY-MM-DD strings to Date
const dateField = z
  .union([
    z.string().datetime({ message: 'Must be a valid ISO date string' }),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')
  ])
  .transform((val) => new Date(val))
  .refine((d) => !isNaN(d.getTime()), { message: 'Must be a valid date' });

// Schema for POST /api/events
const createEventSchema = z
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
    location: z
      .string({
        invalid_type_error: 'Location must be a string'
      })
      .trim()
      .max(200, 'Location cannot exceed 200 characters')
      .optional()
      .nullable(),
    startDate: dateField,
    endDate: dateField,
    registrationDeadline: dateField.optional().nullable(),
    capacity: z
      .union([
        z.number().int('Capacity must be an integer').positive('Capacity must be a positive integer'),
        z.string().regex(/^[1-9]\d*$/, 'Capacity must be a positive integer').transform((val) => parseInt(val, 10))
      ])
      .optional()
      .nullable()
  })
  .strict()
  .refine((data) => data.endDate > data.startDate, {
    message: 'endDate must be later than startDate',
    path: ['endDate']
  })
  .refine(
    (data) => {
      if (data.registrationDeadline != null) {
        return data.registrationDeadline <= data.startDate;
      }
      return true;
    },
    {
      message: 'registrationDeadline cannot be later than startDate',
      path: ['registrationDeadline']
    }
  );

// Schema for PUT /api/events/:eventId
const updateEventSchema = z
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
    location: z
      .string({
        invalid_type_error: 'Location must be a string'
      })
      .trim()
      .max(200, 'Location cannot exceed 200 characters')
      .optional()
      .nullable(),
    startDate: dateField.optional(),
    endDate: dateField.optional(),
    registrationDeadline: dateField.optional().nullable(),
    capacity: z
      .union([
        z.number().int('Capacity must be an integer').positive('Capacity must be a positive integer'),
        z.string().regex(/^[1-9]\d*$/, 'Capacity must be a positive integer').transform((val) => parseInt(val, 10))
      ])
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
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'endDate must be later than startDate',
      path: ['endDate']
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.registrationDeadline != null) {
        return data.registrationDeadline <= data.startDate;
      }
      return true;
    },
    {
      message: 'registrationDeadline cannot be later than startDate',
      path: ['registrationDeadline']
    }
  );

// Schema for GET /api/events query parameters
const eventQuerySchema = z
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
    upcoming: z
      .union([
        z.boolean(),
        z.string().transform((val) => val.toLowerCase() === 'true' || val === '1')
      ])
      .optional(),
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
      .refine((val) => ALLOWED_EVENT_SORT_FIELDS.includes(val), {
        message: `sortBy must be one of: ${ALLOWED_EVENT_SORT_FIELDS.join(', ')}`
      })
      .default('startDate'),
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
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  ALLOWED_EVENT_SORT_FIELDS,
  ALLOWED_SORT_ORDERS,
  MAX_PAGE_SIZE
};

