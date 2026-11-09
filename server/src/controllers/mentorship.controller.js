'use strict';

const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');

// ─── Valid status values ────────────────────────────────────────────────────
const MENTORSHIP_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
});

// ─── Allowed state transitions (mentor / admin) ─────────────────────────────
// PENDING -> ACCEPTED or REJECTED
// ACCEPTED -> COMPLETED
// REJECTED, COMPLETED, CANCELLED -> terminal (no further transitions)
const VALID_TRANSITIONS = Object.freeze({
  [MENTORSHIP_STATUS.PENDING]: [MENTORSHIP_STATUS.ACCEPTED, MENTORSHIP_STATUS.REJECTED],
  [MENTORSHIP_STATUS.ACCEPTED]: [MENTORSHIP_STATUS.COMPLETED],
  [MENTORSHIP_STATUS.REJECTED]: [],
  [MENTORSHIP_STATUS.COMPLETED]: [],
  [MENTORSHIP_STATUS.CANCELLED]: []
});

// ─── Safe format helpers ─────────────────────────────────────────────────────

function safeUserProfile(user) {
  if (!user) return null;
  return {
    id: user.id,
    role: user.role?.name || null,
    fullName: user.alumniProfile?.fullName || null,
    department: user.alumniProfile?.department || null,
    graduationYear: user.alumniProfile?.graduationYear || null,
    currentJobTitle: user.alumniProfile?.currentJobTitle || null,
    currentCompany: user.alumniProfile?.currentCompany || null
  };
}

function formatRequest(req) {
  return {
    id: req.id,
    studentId: req.studentId,
    mentorId: req.mentorId,
    message: req.message,
    status: req.status,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
    student: req.student ? safeUserProfile(req.student) : undefined,
    mentor: req.mentor ? safeUserProfile(req.mentor) : undefined
  };
}

// ─── Shared Prisma include config ─────────────────────────────────────────────

const userInclude = {
  select: {
    id: true,
    role: { select: { name: true } },
    alumniProfile: {
      select: {
        fullName: true,
        department: true,
        graduationYear: true,
        currentJobTitle: true,
        currentCompany: true
      }
    }
  }
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/mentorship/requests
 * Create a mentorship request.
 * Allowed: STUDENT only. studentId = session user. Status always PENDING.
 */
async function createMentorshipRequest(req, res, next) {
  try {
    const student = req.user;

    // Role enforced by route middleware, but double-check for safety
    if (student.role.name !== ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only students can create mentorship requests'
        }
      });
    }

    const { mentorId, message } = req.body;
    const studentId = student.id;

    // Prevent requesting mentorship from oneself
    if (mentorId === studentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'You cannot request mentorship from yourself'
        }
      });
    }

    // Verify the target mentor exists, is active, and has ALUMNI role
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      include: { role: true }
    });

    if (!mentor || !mentor.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Mentor not found or is inactive'
        }
      });
    }

    if (mentor.role.name !== ROLES.ALUMNI) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Mentorship requests can only be sent to alumni mentors'
        }
      });
    }

    // Prevent duplicate PENDING request to the same mentor
    const existingPending = await prisma.mentorshipRequest.findFirst({
      where: {
        studentId,
        mentorId,
        status: MENTORSHIP_STATUS.PENDING
      }
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'You already have a pending mentorship request to this mentor'
        }
      });
    }

    // Create the request (status defaults to PENDING via schema)
    const mentorshipRequest = await prisma.mentorshipRequest.create({
      data: {
        studentId,
        mentorId,
        message: message || null
      },
      include: {
        student: userInclude,
        mentor: userInclude
      }
    });

    return res.status(201).json({
      success: true,
      data: formatRequest(mentorshipRequest),
      message: 'Mentorship request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/mentorship/requests/received
 * View requests addressed to the authenticated user (as mentor).
 * Allowed: ALUMNI (own requests only), ADMIN (all requests).
 */
async function getReceivedRequests(req, res, next) {
  try {
    const user = req.user;
    const { status, page, limit } = req.query;

    const where = {};

    if (user.role.name === ROLES.ALUMNI) {
      // Alumni can only see requests directed to themselves
      where.mentorId = user.id;
    } else if (user.role.name === ROLES.ADMIN) {
      // Admin sees all; no additional filter
    } else {
      // STUDENT should not reach here (blocked by route middleware)
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: only alumni and administrators can view received mentorship requests'
        }
      });
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [totalRecords, requests] = await Promise.all([
      prisma.mentorshipRequest.count({ where }),
      prisma.mentorshipRequest.findMany({
        where,
        include: {
          student: userInclude,
          mentor: userInclude
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return res.status(200).json({
      success: true,
      data: requests.map(formatRequest),
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/mentorship/requests/sent
 * View requests sent by the authenticated student.
 * Allowed: STUDENT only.
 */
async function getSentRequests(req, res, next) {
  try {
    const user = req.user;

    // Role enforced by middleware but verify for safety
    if (user.role.name !== ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only students can view their sent mentorship requests'
        }
      });
    }

    const { status, page, limit } = req.query;

    const where = { studentId: user.id };
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [totalRecords, requests] = await Promise.all([
      prisma.mentorshipRequest.count({ where }),
      prisma.mentorshipRequest.findMany({
        where,
        include: {
          mentor: userInclude
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return res.status(200).json({
      success: true,
      data: requests.map(formatRequest),
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/mentorship/requests/:requestId/status
 * Update request status.
 * Allowed: Assigned mentor or ADMIN.
 * State machine: PENDING -> ACCEPTED/REJECTED; ACCEPTED -> COMPLETED.
 */
async function updateRequestStatus(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.requestId, 10);

    if (isNaN(requestId) || requestId <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid request ID format' }
      });
    }

    const { status: newStatus } = req.body;

    // Students cannot change status
    if (user.role.name === ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Students are not permitted to update mentorship request status'
        }
      });
    }

    const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId }
    });

    if (!mentorshipRequest) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Mentorship request not found' }
      });
    }

    // Ownership check: ALUMNI can only update requests assigned to themselves
    if (user.role.name === ROLES.ALUMNI && mentorshipRequest.mentorId !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: you can only update requests addressed to you'
        }
      });
    }

    // Validate state transition
    const allowedTransitions = VALID_TRANSITIONS[mentorshipRequest.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid status transition: '${mentorshipRequest.status}' → '${newStatus}'. ` +
            `Allowed: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`
        }
      });
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
      include: {
        student: userInclude,
        mentor: userInclude
      }
    });

    return res.status(200).json({
      success: true,
      data: formatRequest(updated),
      message: `Mentorship request ${newStatus.toLowerCase()} successfully`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/mentorship/requests/:requestId
 * Withdraw a mentorship request by setting status = CANCELLED.
 * Allowed: Student who created the request only.
 * Cannot withdraw REJECTED or COMPLETED requests.
 */
async function withdrawMentorshipRequest(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.requestId, 10);

    if (isNaN(requestId) || requestId <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid request ID format' }
      });
    }

    const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId }
    });

    if (!mentorshipRequest) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Mentorship request not found' }
      });
    }

    // Ownership check: only the student who created it can withdraw
    if (mentorshipRequest.studentId !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: you can only withdraw your own mentorship requests'
        }
      });
    }

    // Prevent withdrawal of terminal states
    const nonWithdrawableStatuses = [
      MENTORSHIP_STATUS.REJECTED,
      MENTORSHIP_STATUS.COMPLETED,
      MENTORSHIP_STATUS.CANCELLED
    ];
    if (nonWithdrawableStatuses.includes(mentorshipRequest.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Cannot withdraw a request with status '${mentorshipRequest.status}'`
        }
      });
    }

    // Soft cancel: preserve history
    const cancelled = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { status: MENTORSHIP_STATUS.CANCELLED }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: cancelled.id,
        studentId: cancelled.studentId,
        mentorId: cancelled.mentorId,
        status: cancelled.status,
        updatedAt: cancelled.updatedAt
      },
      message: 'Mentorship request withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMentorshipRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  withdrawMentorshipRequest
};

