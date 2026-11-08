const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');

/**
 * Format application response with safe fields only
 */
function formatApplicationResponse(app) {
  return {
    id: app.id,
    jobId: app.jobId,
    applicantId: app.applicantId,
    coverLetter: app.coverLetter,
    resumeUrl: app.resumeUrl,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    job: app.job
      ? {
          id: app.job.id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location,
          employmentType: app.job.employmentType,
          isActive: app.job.isActive
        }
      : undefined,
    applicant: app.applicant
      ? {
          id: app.applicant.id,
          role: app.applicant.role?.name,
          fullName: app.applicant.alumniProfile?.fullName || null,
          graduationYear: app.applicant.alumniProfile?.graduationYear || null,
          department: app.applicant.alumniProfile?.department || null
        }
      : undefined
  };
}

/**
 * POST /api/jobs/:jobId/applications
 * Submit a job application
 * Allowed: STUDENT, ALUMNI (ADMIN denied)
 */
async function submitApplication(req, res, next) {
  try {
    const user = req.user;

    // Disallow ADMIN from applying
    if (user.role.name === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Administrators are not permitted to submit job applications'
        }
      });
    }

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

    const { coverLetter, resumeUrl } = req.body;
    const applicantId = user.id;

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job || !job.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Cannot apply: Job does not exist or is inactive'
        }
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Cannot apply: The application deadline for this job has passed'
        }
      });
    }

    // Check for existing application (prevent duplicates at application level)
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId
        }
      }
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'You have already submitted an application for this job'
        }
      });
    }

    // Create the job application atomically
    const newApplication = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId,
        coverLetter: coverLetter ?? null,
        resumeUrl: resumeUrl ?? null,
        status: 'PENDING'
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            employmentType: true,
            isActive: true
          }
        },
        applicant: {
          select: {
            id: true,
            role: { select: { name: true } },
            alumniProfile: {
              select: {
                fullName: true,
                graduationYear: true,
                department: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: formatApplicationResponse(newApplication),
      message: 'Job application submitted successfully'
    });
  } catch (error) {
    // Handle Prisma unique constraint race condition
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'You have already submitted an application for this job'
        }
      });
    }
    next(error);
  }
}

/**
 * GET /api/applications/me
 * Get current user's job application history with pagination
 * Allowed: All authenticated users
 */
async function getMyApplications(req, res, next) {
  try {
    const applicantId = req.user.id;
    const { page, limit } = req.query;

    const where = { applicantId };
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalRecords, applications] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        select: {
          id: true,
          jobId: true,
          applicantId: true,
          coverLetter: true,
          resumeUrl: true,
          status: true,
          appliedAt: true,
          updatedAt: true,
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              employmentType: true,
              isActive: true
            }
          }
        },
        orderBy: {
          appliedAt: 'desc'
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
      data: applications.map(formatApplicationResponse),
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
 * GET /api/applications/:applicationId
 * Get application details
 * Allowed: Applicant, Job Creator, or ADMIN
 */
async function getApplicationById(req, res, next) {
  try {
    const applicationId = parseInt(req.params.applicationId, 10);
    if (isNaN(applicationId) || applicationId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid application ID format'
        }
      });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            employmentType: true,
            isActive: true,
            createdById: true
          }
        },
        applicant: {
          select: {
            id: true,
            role: { select: { name: true } },
            alumniProfile: {
              select: {
                fullName: true,
                graduationYear: true,
                department: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Job application not found'
        }
      });
    }

    const user = req.user;
    const isApplicant = application.applicantId === user.id;
    const isJobCreator = application.job?.createdById === user.id;
    const isAdmin = user.role.name === ROLES.ADMIN;

    if (!isApplicant && !isJobCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: you do not have permission to view this application'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: formatApplicationResponse(application)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/applications/:applicationId/status
 * Update application status
 * Allowed: Job Creator or ADMIN (Applicants CANNOT change status)
 */
async function updateApplicationStatus(req, res, next) {
  try {
    const applicationId = parseInt(req.params.applicationId, 10);
    if (isNaN(applicationId) || applicationId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid application ID format'
        }
      });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            createdById: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Job application not found'
        }
      });
    }

    const user = req.user;
    const isJobCreator = application.job?.createdById === user.id;
    const isAdmin = user.role.name === ROLES.ADMIN;

    if (!isJobCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: only the job creator or an administrator can update the application status'
        }
      });
    }

    const { status } = req.body;

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            employmentType: true,
            isActive: true
          }
        },
        applicant: {
          select: {
            id: true,
            role: { select: { name: true } },
            alumniProfile: {
              select: {
                fullName: true,
                graduationYear: true,
                department: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: formatApplicationResponse(updatedApplication),
      message: 'Application status updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/applications/:applicationId
 * Withdraw an application
 * Allowed: Applicant only
 */
async function withdrawApplication(req, res, next) {
  try {
    const applicationId = parseInt(req.params.applicationId, 10);
    if (isNaN(applicationId) || applicationId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid application ID format'
        }
      });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Job application not found'
        }
      });
    }

    const user = req.user;
    const isApplicant = application.applicantId === user.id;

    if (!isApplicant) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: only the applicant can withdraw this application'
        }
      });
    }

    // Soft withdrawal: Update status to 'WITHDRAWN' to preserve application history
    const withdrawnApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' }
    });

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: {
        id: withdrawnApplication.id,
        status: withdrawnApplication.status
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication
};

