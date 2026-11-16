const { z } = require('zod');

const adminVerifySchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REVOKE']),
  status: z.enum(['APPROVED', 'REJECTED', 'REVOKED']).optional(),
  reason: z.string().trim().max(500, 'Reason cannot exceed 500 characters').optional(),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional()
}).strict();

const publicVerifyQuerySchema = z.object({
  code: z.string().trim().min(3, 'Verification identifier or token required')
});

module.exports = {
  adminVerifySchema,
  publicVerifyQuerySchema
};
