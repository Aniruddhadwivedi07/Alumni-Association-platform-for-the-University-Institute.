'use strict';

const express = require('express');
const {
  createStory,
  getPublishedStories,
  getStoryById,
  getMyStories,
  updateStory,
  publishStory,
  unpublishStory,
  deleteStory
} = require('../controllers/successStory.controller');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  createSuccessStorySchema,
  updateSuccessStorySchema,
  publicStoryQuerySchema,
  myStoryQuerySchema
} = require('../validators/successStory.validator');
const { ROLES } = require('../constants/roles');
const prisma = require('../prisma');

const router = express.Router();

/**
 * Optional authentication middleware:
 * Populates req.user if a session exists, but allows unauthenticated requests to proceed.
 */
async function optionalAuth(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return next();
    }
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        role: true,
        alumniProfile: true
      }
    });
    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// Public Endpoints
// -------------------------------------------------------------

// GET /api/success-stories - Public listing of published stories
router.get('/', validateQuery(publicStoryQuerySchema), getPublishedStories);

// GET /api/success-stories/my - Authenticated user's stories (ALUMNI, ADMIN)
// Must be registered before /:storyId
router.get(
  '/my',
  requireAuth,
  authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN),
  validateQuery(myStoryQuerySchema),
  getMyStories
);

// GET /api/success-stories/:storyId - Public for published; Author/ADMIN for drafts
router.get('/:storyId', optionalAuth, getStoryById);

// -------------------------------------------------------------
// Authenticated Endpoints
// -------------------------------------------------------------

// POST /api/success-stories - Create a story (ALUMNI, ADMIN)
router.post(
  '/',
  requireAuth,
  authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN),
  validateBody(createSuccessStorySchema),
  createStory
);

// PUT /api/success-stories/:storyId - Update a story (Author or ADMIN)
router.put(
  '/:storyId',
  requireAuth,
  validateBody(updateSuccessStorySchema),
  updateStory
);

// PATCH /api/success-stories/:storyId/publish - Publish a story (Author or ADMIN)
router.patch(
  '/:storyId/publish',
  requireAuth,
  publishStory
);

// PATCH /api/success-stories/:storyId/unpublish - Unpublish a story (Author or ADMIN)
router.patch(
  '/:storyId/unpublish',
  requireAuth,
  unpublishStory
);

// DELETE /api/success-stories/:storyId - Delete a story (Author or ADMIN)
router.delete(
  '/:storyId',
  requireAuth,
  deleteStory
);

module.exports = router;

