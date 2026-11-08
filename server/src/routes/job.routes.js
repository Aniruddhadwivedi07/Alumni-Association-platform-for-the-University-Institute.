const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deactivateJob
} = require('../controllers/job.controller');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema
} = require('../validators/job.validator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All job routes require authentication
router.use(requireAuth);

// GET /api/jobs - List active jobs with search/filtering/pagination (All authenticated users: STUDENT, ALUMNI, ADMIN)
router.get('/', validateQuery(jobQuerySchema), getJobs);

// POST /api/jobs - Create a new job listing (Only ALUMNI and ADMIN)
router.post(
  '/',
  authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN),
  validateBody(createJobSchema),
  createJob
);

// GET /api/jobs/:jobId - Get job details by ID (All authenticated users)
router.get('/:jobId', getJobById);

// PUT /api/jobs/:jobId - Update a job (Creator or ADMIN)
router.put('/:jobId', validateBody(updateJobSchema), updateJob);

// DELETE /api/jobs/:jobId - Deactivate a job (Creator or ADMIN)
router.delete('/:jobId', deactivateJob);

module.exports = router;

