const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');

/**
 * Format registration object safely
 */
function formatRegistrationResponse(reg) {
  return {
    id: reg.id,
    eventId: reg.eventId,
    userId: reg.userId,
    status: reg.status,
    registeredAt: reg.registeredAt,
    updatedAt: reg.updatedAt,
    event: reg.event
      ? {
          id: reg.event.id,
          title: reg.event.title,
          description: reg.event.description,
          location: reg.event.location,
          startDate: reg.event.startDate,
          endDate: reg.event.endDate,
          capacity: reg.event.capacity,
          isActive: reg.event.isActive
        }
      : undefined,
    user: reg.user
      ? {
          id: reg.user.id,
          role: reg.user.role?.name,
          fullName: reg.user.alumniProfile?.fullName || null,
          department: reg.user.alumniProfile?.department || null,
          graduationYear: reg.user.alumniProfile?.graduationYear || null
        }
      : undefined
  };
}

/**
 * POST /api/events/:eventId/register
 * Register current authenticated user for an event
 * Allowed: STUDENT, ALUMNI (ADMIN blocked unless permitted)
 */
async function registerForEvent(req, res, next) {
  try {
    const user = req.user;

    // Disallow ADMIN from registering per requirement
    if (user.role.name === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Administrators are not permitted to register for events'
        }
      });
    }

    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid event ID format'
        }
      });
    }

    const userId = user.id;

    // Run capacity check, deadline check, and registration atomically inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock the event row for update to prevent concurrent capacity race conditions
      const events = await tx.$queryRaw`
        SELECT * FROM "Event" WHERE id = ${eventId} FOR UPDATE
      `;

      if (!events || events.length === 0) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      const event = events[0];

      // 2. Check if active
      if (!event.isActive) {
        const error = new Error('Cannot register: Event is inactive or cancelled');
        error.statusCode = 400;
        error.code = 'BAD_REQUEST';
        throw error;
      }

      const now = new Date();

      // 3. Prevent registration after event start time
      if (now >= new Date(event.startDate)) {
        const error = new Error('Cannot register: Event has already started');
        error.statusCode = 400;
        error.code = 'BAD_REQUEST';
        throw error;
      }

      // 4. Prevent registration after registration deadline (if set)
      if (event.registrationDeadline && now > new Date(event.registrationDeadline)) {
        const error = new Error('Cannot register: Registration deadline has passed');
        error.statusCode = 400;
        error.code = 'BAD_REQUEST';
        throw error;
      }

      // 5. Check if user already has a registration
      const existingRegistration = await tx.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        }
      });

      if (existingRegistration && existingRegistration.status === 'REGISTERED') {
        const error = new Error('You are already registered for this event');
        error.statusCode = 409;
        error.code = 'CONFLICT';
        throw error;
      }

      // 6. Capacity check: Count currently active 'REGISTERED' attendees
      if (event.capacity != null) {
        const activeCount = await tx.eventRegistration.count({
          where: {
            eventId,
            status: 'REGISTERED'
          }
        });

        if (activeCount >= event.capacity) {
          const error = new Error('Cannot register: Event capacity has been reached');
          error.statusCode = 409;
          error.code = 'CONFLICT';
          throw error;
        }
      }

      // 7. Upsert registration: if previously CANCELLED, re-register (status = 'REGISTERED'); otherwise create
      const registration = await tx.eventRegistration.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        },
        update: {
          status: 'REGISTERED',
          updatedAt: now
        },
        create: {
          eventId,
          userId,
          status: 'REGISTERED'
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              startDate: true,
              endDate: true,
              capacity: true,
              isActive: true
            }
          },
          user: {
            select: {
              id: true,
              role: { select: { name: true } },
              alumniProfile: {
                select: {
                  fullName: true,
                  department: true,
                  graduationYear: true
                }
              }
            }
          }
        }
      });

      return registration;
    });

    return res.status(201).json({
      success: true,
      data: formatRegistrationResponse(result),
      message: 'Event registration successful'
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'BAD_REQUEST',
          message: error.message
        }
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'You are already registered for this event'
        }
      });
    }

    next(error);
  }
}

/**
 * GET /api/events/my-registrations
 * Retrieve list of event registrations for the authenticated user
 */
async function getMyRegistrations(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;

    const where = { userId };
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalRecords, registrations] = await Promise.all([
      prisma.eventRegistration.count({ where }),
      prisma.eventRegistration.findMany({
        where,
        select: {
          id: true,
          eventId: true,
          userId: true,
          status: true,
          registeredAt: true,
          updatedAt: true,
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              startDate: true,
              endDate: true,
              capacity: true,
              isActive: true
            }
          }
        },
        orderBy: {
          registeredAt: 'desc'
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
      data: registrations.map(formatRegistrationResponse),
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
 * GET /api/events/:eventId/attendees
 * Retrieve list of active registered attendees for an event
 * Allowed: Event Creator or ADMIN
 */
async function getEventAttendees(req, res, next) {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid event ID format'
        }
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    const user = req.user;
    const isOwner = event.createdById === user.id;
    const isAdmin = user.role.name === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: only the event creator or an administrator can view attendees'
        }
      });
    }

    const { page, limit } = req.query;
    const where = {
      eventId,
      status: 'REGISTERED'
    };

    const skip = (page - 1) * limit;
    const take = limit;

    const [totalRecords, registrations] = await Promise.all([
      prisma.eventRegistration.count({ where }),
      prisma.eventRegistration.findMany({
        where,
        select: {
          id: true,
          status: true,
          registeredAt: true,
          user: {
            select: {
              id: true,
              role: { select: { name: true } },
              alumniProfile: {
                select: {
                  fullName: true,
                  department: true,
                  graduationYear: true
                }
              }
            }
          }
        },
        orderBy: {
          registeredAt: 'asc'
        },
        skip,
        take
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const attendees = registrations.map((r) => ({
      registrationId: r.id,
      userId: r.user.id,
      role: r.user.role?.name,
      fullName: r.user.alumniProfile?.fullName || null,
      department: r.user.alumniProfile?.department || null,
      graduationYear: r.user.alumniProfile?.graduationYear || null,
      status: r.status,
      registeredAt: r.registeredAt
    }));

    return res.status(200).json({
      success: true,
      data: attendees,
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
 * DELETE /api/events/:eventId/register
 * Withdraw registration (set status = CANCELLED)
 * Allowed: Authenticated registrant only
 */
async function withdrawRegistration(req, res, next) {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid event ID format'
        }
      });
    }

    const userId = req.user.id;

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Registration not found'
        }
      });
    }

    // Soft withdrawal: Update status to CANCELLED
    const cancelledRegistration = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' }
    });

    return res.status(200).json({
      success: true,
      message: 'Event registration withdrawn successfully',
      data: {
        id: cancelledRegistration.id,
        eventId: cancelledRegistration.eventId,
        userId: cancelledRegistration.userId,
        status: cancelledRegistration.status
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventAttendees,
  withdrawRegistration
};

