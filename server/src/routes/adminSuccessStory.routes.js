'use strict';

const express = require('express');
const {
  getAllStories,
  getStoryForReview,
  publishStory,
  unpublishStory,
  deleteStory
} = require('../controllers/adminSuccessStory.controller');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { validateQuery } = require('../middlewares/validate');
const { adminStoryQuerySchema } = require('../validators/adminSuccessStory.validator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All administrative success story routes require authentication and ADMIN role
router.use(requireAuth);
router.use(authorizeRoles(ROLES.ADMIN));

// GET /api/admin/success-stories - Get all stories (published & unpublished) with filters
router.get('/', validateQuery(adminStoryQuerySchema), getAllStories);

// GET /api/admin/success-stories/:storyId - Get a specific story for review
router.get('/:storyId', getStoryForReview);

// PATCH /api/admin/success-stories/:storyId/publish - Publish any story
router.patch('/:storyId/publish', publishStory);

// PATCH /api/admin/success-stories/:storyId/unpublish - Unpublish any story
router.patch('/:storyId/unpublish', unpublishStory);

// DELETE /api/admin/success-stories/:storyId - Delete any story
router.delete('/:storyId', deleteStory);

module.exports = router;

