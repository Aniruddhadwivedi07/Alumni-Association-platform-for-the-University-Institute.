'use strict';

const prisma = require('../prisma');

/**
 * Author select fields for administrative oversight (includes email)
 * Never exposes passwordHash or session tokens.
 */
const adminAuthorSelect = {
  select: {
    id: true,
    email: true,
    isActive: true,
    role: {
      select: {
        name: true
      }
    },
    alumniProfile: {
      select: {
        fullName: true,
        graduationYear: true,
        department: true
      }
    }
  }
};

/**
 * Helper to format administrative story response
 */
function formatAdminStory(story) {
  if (!story) return null;

  return {
    id: story.id,
    title: story.title,
    content: story.content,
    imageUrl: story.imageUrl,
    isPublished: story.isPublished,
    publishedAt: story.publishedAt,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
    authorId: story.authorId,
    author: story.author
      ? {
          id: story.author.id,
          email: story.author.email,
          isActive: story.author.isActive,
          role: story.author.role?.name,
          fullName: story.author.alumniProfile?.fullName || 'Alumni Member',
          graduationYear: story.author.alumniProfile?.graduationYear || null,
          department: story.author.alumniProfile?.department || null
        }
      : undefined
  };
}

/**
 * GET /api/admin/success-stories
 * Get all success stories (published and unpublished) with filters, search, sorting, and pagination
 * Allowed: ADMIN only
 */
async function getAllStories(req, res, next) {
  try {
    const { status, authorId, search, sortBy, sortOrder, page, limit } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'unpublished') {
      where.isPublished = false;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {
      [sortBy]: sortOrder
    };

    const [totalRecords, stories] = await Promise.all([
      prisma.successStory.count({ where }),
      prisma.successStory.findMany({
        where,
        include: {
          author: adminAuthorSelect
        },
        orderBy,
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return res.status(200).json({
      success: true,
      data: stories.map(formatAdminStory),
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
 * GET /api/admin/success-stories/:storyId
 * Get a specific story for review (published or unpublished) with author details
 * Allowed: ADMIN only
 */
async function getStoryForReview(req, res, next) {
  try {
    const { storyId } = req.params;

    const story = await prisma.successStory.findUnique({
      where: { id: storyId },
      include: {
        author: adminAuthorSelect
      }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Success story not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: formatAdminStory(story)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/success-stories/:storyId/publish
 * Publish any success story idempotently
 * Allowed: ADMIN only
 */
async function publishStory(req, res, next) {
  try {
    const { storyId } = req.params;

    const story = await prisma.successStory.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Success story not found'
        }
      });
    }

    const updatedStory = await prisma.successStory.update({
      where: { id: storyId },
      data: {
        isPublished: true,
        publishedAt: story.publishedAt || new Date()
      },
      include: {
        author: adminAuthorSelect
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Success story published successfully by administrator',
      data: formatAdminStory(updatedStory)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/success-stories/:storyId/unpublish
 * Unpublish any success story idempotently
 * Allowed: ADMIN only
 */
async function unpublishStory(req, res, next) {
  try {
    const { storyId } = req.params;

    const story = await prisma.successStory.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Success story not found'
        }
      });
    }

    const updatedStory = await prisma.successStory.update({
      where: { id: storyId },
      data: {
        isPublished: false,
        publishedAt: null
      },
      include: {
        author: adminAuthorSelect
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Success story unpublished successfully by administrator',
      data: formatAdminStory(updatedStory)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/success-stories/:storyId
 * Delete any success story as administrator
 * Allowed: ADMIN only
 */
async function deleteStory(req, res, next) {
  try {
    const { storyId } = req.params;

    const story = await prisma.successStory.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Success story not found'
        }
      });
    }

    await prisma.successStory.delete({
      where: { id: storyId }
    });

    return res.status(200).json({
      success: true,
      message: 'Success story deleted successfully by administrator'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllStories,
  getStoryForReview,
  publishStory,
  unpublishStory,
  deleteStory
};

