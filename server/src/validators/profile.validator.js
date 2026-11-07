const { z } = require('zod');

const updateProfileSchema = z
  .object({
    fullName: z
      .string({
        invalid_type_error: 'Full name must be a string'
      })
      .trim()
      .min(1, 'Full name cannot be empty')
      .max(100, 'Full name cannot exceed 100 characters')
      .optional(),
    graduationYear: z
      .union([
        z.number().int('Graduation year must be an integer').min(1950, 'Graduation year must be 1950 or later').max(2100, 'Graduation year is invalid'),
        z.string().regex(/^\d{4}$/, 'Graduation year must be a 4-digit number').transform((val) => parseInt(val, 10))
      ])
      .refine((val) => val >= 1950 && val <= 2100, {
        message: 'Graduation year must be between 1950 and 2100'
      })
      .optional()
      .nullable(),
    department: z
      .string({
        invalid_type_error: 'Department must be a string'
      })
      .trim()
      .max(100, 'Department cannot exceed 100 characters')
      .optional()
      .nullable(),
    currentJobTitle: z
      .string({
        invalid_type_error: 'Current job title must be a string'
      })
      .trim()
      .max(100, 'Current job title cannot exceed 100 characters')
      .optional()
      .nullable(),
    currentCompany: z
      .string({
        invalid_type_error: 'Current company must be a string'
      })
      .trim()
      .max(100, 'Current company cannot exceed 100 characters')
      .optional()
      .nullable(),
    bio: z
      .string({
        invalid_type_error: 'Bio must be a string'
      })
      .trim()
      .max(1000, 'Bio cannot exceed 1000 characters')
      .optional()
      .nullable(),
    linkedinUrl: z
      .string({
        invalid_type_error: 'LinkedIn URL must be a string'
      })
      .trim()
      .url('LinkedIn URL must be a valid URL')
      .regex(/^https?:\/\/(www\.)?linkedin\.com\/.+/i, 'Must be a valid LinkedIn profile URL')
      .optional()
      .nullable()
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided for update'
    }
  );

module.exports = {
  updateProfileSchema
};

