'use strict';

const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');

/**
 * Helper to format safe story response without leaking private user/auth data
 */
function formatStoryResponse(story) {
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
    author: story.author
      ? {
          id: story.author.id,
          fullName: story.author.alumniProfile?.fullName || 'Alumni Member',
          graduationYear: story.author.alumniProfile?.graduationYear || null,
          department: story.author.alumniProfile?.department || null
        }
      : undefined
  };
}

/**
 * Standard select clause for author to prevent leaking password hashes, sessions, etc.
 */
const authorSelect = {
  select: {
    id: true,
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
 * POST /api/success-stories
 * Create a new success story
 * Access: ALUMNI, ADMIN
 */
async function createStory(req, res, next) {
  try {
    const { title, content, imageUrl } = req.body;
    const authorId = req.user.id;

    // Strict constraint: new stories always start as unpublished
    const story = await prisma.successStory.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        authorId,
        isPublished: false,
        publishedAt: null
      },
      include: {
        author: authorSelect
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Success story created successfully',
      data: formatStoryResponse(story)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/success-stories
 * Get published success stories (Public)
 */
async function getPublishedStories(req, res, next) {
  try {
    const { page, limit, search, sortBy, sortOrder } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true
    };

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
          author: authorSelect
        },
        orderBy,
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return res.status(200).json({
      success: true,
      data: stories.map(formatStoryResponse),
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
 * GET /api/success-stories/:storyId
 * Get a specific success story
 * Access: Public if published; Author or ADMIN if unpublished
 */
async function getStoryById(req, res, next) {
  try {
    const { storyId } = req.params;

    const story = await prisma.successStory.findUnique({
      where: { id: storyId },
      include: {
        author: authorSelect
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

    // If published, anyone can view
    if (story.isPublished) {
      return res.status(200).json({
        success: true,
        data: formatStoryResponse(story)
      });
    }

    // If unpublished, require authenticated author or ADMIN
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Success story not found'
        }
      });
    }

    const isAuthor = story.authorId === currentUser.id;
    const isAdmin = currentUser.role?.name === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      // Do not reveal unpublished content to unauthorized users
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
      data: formatStoryResponse(story)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/success-stories/my
 * Get authenticated user's own success stories
 * Access: ALUMNI, ADMIN
 */
async function getMyStories(req, res, next) {
  try {
    const authorId = req.user.id;
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      authorId
    };

    const [totalRecords, stories] = await Promise.all([
      prisma.successStory.count({ where }),
      prisma.successStory.findMany({
        where,
        include: {
          author: authorSelect
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return res.status(200).json({
      success: true,
      data: stories.map(formatStoryResponse),
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
 * PUT /api/success-stories/:storyId
 * Update a success story
 * Access: Author or ADMIN
 */
async function updateStory(req, res, next) {
  try {
    const { storyId } = req.params;
    const currentUser = req.user;

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

    const isAuthor = story.authorId === currentUser.id;
    const isAdmin = currentUser.role?.name === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You do not have permission to update this story'
        }
      });
    }

    // Only allow updating title, content, imageUrl
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;

    const updatedStory = await prisma.successStory.update({
      where: { id: storyId },
      data: updateData,
      include: {
        author: authorSelect
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Success story updated successfully',
      data: formatStoryResponse(updatedStory)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/success-stories/:storyId/publish
 * Publish a success story
 * Access: Author or ADMIN
 */
async function publishStory(req, res, next) {
  try {
    const { storyId } = req.params;
    const currentUser = req.user;

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

    const isAuthor = story.authorId === currentUser.id;
    const isAdmin = currentUser.role?.name === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You do not have permission to publish this story'
        }
      });
    }

    // Idempotent publish: set isPublished = true, set publishedAt if not already set or refresh
    const updatedStory = await prisma.successStory.update({
      where: { id: storyId },
      data: {
        isPublished: true,
        publishedAt: story.publishedAt || new Date()
      },
      include: {
        author: authorSelect
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Success story published successfully',
      data: formatStoryResponse(updatedStory)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/success-stories/:storyId/unpublish
 * Unpublish a success story
 * Access: Author or ADMIN
 */
async function unpublishStory(req, res, next) {
  try {
    const { storyId } = req.params;
    const currentUser = req.user;

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

    const isAuthor = story.authorId === currentUser.id;
    const isAdmin = currentUser.role?.name === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You do not have permission to unpublish this story'
        }
      });
    }

    // Idempotent unpublish: set isPublished = false, publishedAt = null
    const updatedStory = await prisma.successStory.update({
      where: { id: storyId },
      data: {
        isPublished: false,
        publishedAt: null
      },
      include: {
        author: authorSelect
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Success story unpublished successfully',
      data: formatStoryResponse(updatedStory)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/success-stories/:storyId
 * Delete a success story
 * Access: Author or ADMIN
 */
async function deleteStory(req, res, next) {
  try {
    const { storyId } = req.params;
    const currentUser = req.user;

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

    const isAuthor = story.authorId === currentUser.id;
    const isAdmin = currentUser.role?.name === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You do not have permission to delete this story'
        }
      });
    }

    await prisma.successStory.delete({
      where: { id: storyId }
    });

    return res.status(200).json({
      success: true,
      message: 'Success story deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createStory,
  getPublishedStories,
  getStoryById,
  getMyStories,
  updateStory,
  publishStory,
  unpublishStory,
  deleteStory
};

