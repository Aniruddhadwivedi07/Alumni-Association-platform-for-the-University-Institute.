const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');

/**
 * Format event object with safe creator fields only
 */
function formatEventResponse(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    startDate: event.startDate,
    endDate: event.endDate,
    registrationDeadline: event.registrationDeadline,
    capacity: event.capacity,
    isActive: event.isActive,
    createdById: event.createdById,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    createdBy: event.createdBy
      ? {
          id: event.createdBy.id,
          role: event.createdBy.role?.name,
          fullName: event.createdBy.alumniProfile?.fullName || null
        }
      : undefined
  };
}

/**
 * POST /api/events
 * Create a new event
 * Allowed: ALUMNI, ADMIN (STUDENT receives 403 Forbidden)
 */
async function createEvent(req, res, next) {
  try {
    const userId = req.session.userId;
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      registrationDeadline,
      capacity
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location: location ?? null,
        startDate,
        endDate,
        registrationDeadline: registrationDeadline ?? null,
        capacity: capacity ?? null,
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
      data: formatEventResponse(event),
      message: 'Event created successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/events
 * List active events with search, filtering, sorting, and pagination
 */
async function getEvents(req, res, next) {
  try {
    const {
      search,
      location,
      upcoming,
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

    // Search across title, description, location
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (location) {
      andConditions.push({
        location: { contains: location, mode: 'insensitive' }
      });
    }

    if (upcoming === true) {
      andConditions.push({
        startDate: {
          gt: new Date()
        }
      });
    }

    const where = {
      AND: andConditions
    };

    const skip = (page - 1) * limit;
    const take = limit;

    const [totalRecords, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          startDate: true,
          endDate: true,
          registrationDeadline: true,
          capacity: true,
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
      data: events.map(formatEventResponse),
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
 * GET /api/events/:eventId
 * Get details of an active event by ID
 */
async function getEventById(req, res, next) {
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
      where: { id: eventId },
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

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: formatEventResponse(event)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/events/:eventId
 * Update an event
 * Allowed: Event Creator or ADMIN
 */
async function updateEvent(req, res, next) {
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
          message: 'Access denied: only the event creator or an administrator can update this event'
        }
      });
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      registrationDeadline,
      capacity
    } = req.body;

    // Validate combined date relationships
    const effectiveStartDate = startDate !== undefined ? startDate : event.startDate;
    const effectiveEndDate = endDate !== undefined ? endDate : event.endDate;
    const effectiveDeadline = registrationDeadline !== undefined ? registrationDeadline : event.registrationDeadline;

    if (effectiveEndDate <= effectiveStartDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'endDate must be later than startDate',
          details: [{ field: 'endDate', message: 'endDate must be later than startDate' }]
        }
      });
    }

    if (effectiveDeadline != null && effectiveDeadline > effectiveStartDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'registrationDeadline cannot be later than startDate',
          details: [{ field: 'registrationDeadline', message: 'registrationDeadline cannot be later than startDate' }]
        }
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (registrationDeadline !== undefined) updateData.registrationDeadline = registrationDeadline;
    if (capacity !== undefined) updateData.capacity = capacity;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
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
      data: formatEventResponse(updatedEvent),
      message: 'Event updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/events/:eventId
 * Cancel an event (soft cancel: isActive = false)
 * Allowed: Event Creator or ADMIN
 */
async function cancelEvent(req, res, next) {
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
          message: 'Access denied: only the event creator or an administrator can cancel this event'
        }
      });
    }

    // Soft delete: set isActive to false
    const cancelledEvent = await prisma.event.update({
      where: { id: eventId },
      data: { isActive: false }
    });

    return res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      data: {
        id: cancelledEvent.id,
        isActive: cancelledEvent.isActive
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  cancelEvent
};

