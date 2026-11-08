const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');

/**
 * Format a job record to safely expose only non-sensitive creator info
 */
function formatJobResponse(job) {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    company: job.company,
    location: job.location,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    applicationDeadline: job.applicationDeadline,
    isActive: job.isActive,
    createdById: job.createdById,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    createdBy: job.createdBy
      ? {
          id: job.createdBy.id,
          role: job.createdBy.role?.name,
          fullName: job.createdBy.alumniProfile?.fullName || null
        }
      : undefined
  };
}

/**
 * POST /api/jobs
 * Create a new job listing
 * Allowed: ALUMNI, ADMIN (STUDENT receives 403 Forbidden)
 */
async function createJob(req, res, next) {
  try {
    const userId = req.session.userId;
    const {
      title,
      description,
      company,
      location,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      applicationDeadline
    } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location: location ?? null,
        employmentType,
        experienceLevel: experienceLevel ?? null,
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        applicationDeadline: applicationDeadline ?? null,
        isActive: true,
        createdById: userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            role: {
              select: {
                name: true
              }
            },
            alumniProfile: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: formatJobResponse(job),
      message: 'Job created successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/jobs
 * List active job postings with search, filtering, sorting, and pagination
 */
async function getJobs(req, res, next) {
  try {
    const {
      search,
      location,
      employmentType,
      experienceLevel,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const andConditions = [
      {
        isActive: true
      }
    ];

    // Search across title, company, description
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (location) {
      andConditions.push({
        location: { contains: location, mode: 'insensitive' }
      });
    }

    if (employmentType) {
      andConditions.push({
        employmentType: { contains: employmentType, mode: 'insensitive' }
      });
    }

    if (experienceLevel) {
      andConditions.push({
        experienceLevel: { contains: experienceLevel, mode: 'insensitive' }
      });
    }

    const where = {
      AND: andConditions
    };

    const skip = (page - 1) * limit;
    const take = limit;

    const [totalRecords, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          company: true,
          location: true,
          employmentType: true,
          experienceLevel: true,
          salaryMin: true,
          salaryMax: true,
          applicationDeadline: true,
          isActive: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: {
              id: true,
              role: {
                select: {
                  name: true
                }
              },
              alumniProfile: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      data: jobs.map(formatJobResponse),
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/jobs/:jobId
 * Get job details by ID (active jobs only)
 */
async function getJobById(req, res, next) {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid job ID format'
        }
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        createdBy: {
          select: {
            id: true,
            role: {
              select: {
                name: true
              }
            },
            alumniProfile: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: formatJobResponse(job)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/jobs/:jobId
 * Update an existing job
 * Allowed: Job Creator or ADMIN
 */
async function updateJob(req, res, next) {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid job ID format'
        }
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    const user = req.user;
    const isOwner = job.createdById === user.id;
    const isAdmin = user.role.name === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: only the job creator or an administrator can update this job'
        }
      });
    }

    const {
      title,
      description,
      company,
      location,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      applicationDeadline
    } = req.body;

    // Validate cross-field salary consistency combining existing and updated values
    const effectiveSalaryMin = salaryMin !== undefined ? salaryMin : job.salaryMin;
    const effectiveSalaryMax = salaryMax !== undefined ? salaryMax : job.salaryMax;

    if (effectiveSalaryMin != null && effectiveSalaryMax != null && effectiveSalaryMin > effectiveSalaryMax) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'salaryMin cannot exceed salaryMax',
          details: [{ field: 'salaryMin', message: 'salaryMin cannot exceed salaryMax' }]
        }
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (company !== undefined) updateData.company = company;
    if (location !== undefined) updateData.location = location;
    if (employmentType !== undefined) updateData.employmentType = employmentType;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax;
    if (applicationDeadline !== undefined) updateData.applicationDeadline = applicationDeadline;

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            role: {
              select: {
                name: true
              }
            },
            alumniProfile: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: formatJobResponse(updatedJob),
      message: 'Job updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/jobs/:jobId
 * Deactivate a job (soft delete: isActive = false)
 * Allowed: Job Creator or ADMIN
 */
async function deactivateJob(req, res, next) {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid job ID format'
        }
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    const user = req.user;
    const isOwner = job.createdById === user.id;
    const isAdmin = user.role.name === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: only the job creator or an administrator can deactivate this job'
        }
      });
    }

    // Set isActive to false; idempotent if already deactivated
    const deactivatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { isActive: false }
    });

    return res.status(200).json({
      success: true,
      message: 'Job deactivated successfully',
      data: {
        id: deactivatedJob.id,
        isActive: deactivatedJob.isActive
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deactivateJob
};

