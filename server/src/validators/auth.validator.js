const { z } = require('zod');

const registerSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string'
    })
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string'
    })
    .min(8, 'Password must be at least 8 characters long'),
  fullName: z
    .string({
      required_error: 'Full name is required',
      invalid_type_error: 'Full name must be a string'
    })
    .trim()
    .min(1, 'Full name cannot be empty'),
  graduationYear: z
    .union([
      z.number().int('Graduation year must be an integer'),
      z.string().regex(/^\d{4}$/, 'Graduation year must be a 4-digit number').transform((val) => parseInt(val, 10))
    ])
    .optional()
    .nullable(),
  department: z
    .string({
      invalid_type_error: 'Department must be a string'
    })
    .trim()
    .optional()
    .nullable()
});

module.exports = {
  registerSchema
};

