const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  cancelEvent
} = require('../controllers/event.controller');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema
} = require('../validators/event.validator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All event routes require authentication
router.use(requireAuth);

// GET /api/events - List active events with search/filtering/pagination (All authenticated users: STUDENT, ALUMNI, ADMIN)
router.get('/', validateQuery(eventQuerySchema), getEvents);

// POST /api/events - Create a new event (Only ALUMNI and ADMIN)
router.post(
  '/',
  authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN),
  validateBody(createEventSchema),
  createEvent
);

// GET /api/events/:eventId - Get event details by ID (All authenticated users)
router.get('/:eventId', getEventById);

// PUT /api/events/:eventId - Update an event (Creator or ADMIN)
router.put('/:eventId', validateBody(updateEventSchema), updateEvent);

// DELETE /api/events/:eventId - Cancel an event (Creator or ADMIN)
router.delete('/:eventId', cancelEvent);

module.exports = router;

