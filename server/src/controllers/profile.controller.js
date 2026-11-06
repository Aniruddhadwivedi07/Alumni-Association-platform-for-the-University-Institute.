const prisma = require('../prisma');

/**
 * GET /api/profile/me
 * Fetch the authenticated user's profile using session identity
 */
async function getMyProfile(req, res, next) {
  try {
    const userId = req.session.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        alumniProfile: true
      }
    });

    if (!user || !user.alumniProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        isActive: user.isActive,
        profile: {
          id: user.alumniProfile.id,
          fullName: user.alumniProfile.fullName,
          graduationYear: user.alumniProfile.graduationYear,
          department: user.alumniProfile.department,
          currentJobTitle: user.alumniProfile.currentJobTitle,
          currentCompany: user.alumniProfile.currentCompany,
          bio: user.alumniProfile.bio,
          linkedinUrl: user.alumniProfile.linkedinUrl,
          createdAt: user.alumniProfile.createdAt,
          updatedAt: user.alumniProfile.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/profile/me
 * Update the authenticated user's own AlumniProfile
 */
async function updateMyProfile(req, res, next) {
  try {
    const userId = req.session.userId;

    // Check if profile exists for authenticated user
    const existingProfile = await prisma.alumniProfile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found'
        }
      });
    }

    const {
      fullName,
      graduationYear,
      department,
      currentJobTitle,
      currentCompany,
      bio,
      linkedinUrl
    } = req.body;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    if (department !== undefined) updateData.department = department;
    if (currentJobTitle !== undefined) updateData.currentJobTitle = currentJobTitle;
    if (currentCompany !== undefined) updateData.currentCompany = currentCompany;
    if (bio !== undefined) updateData.bio = bio;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;

    const updatedProfile = await prisma.alumniProfile.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          include: {
            role: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updatedProfile.user.id,
        email: updatedProfile.user.email,
        role: updatedProfile.user.role.name,
        profile: {
          id: updatedProfile.id,
          fullName: updatedProfile.fullName,
          graduationYear: updatedProfile.graduationYear,
          department: updatedProfile.department,
          currentJobTitle: updatedProfile.currentJobTitle,
          currentCompany: updatedProfile.currentCompany,
          bio: updatedProfile.bio,
          linkedinUrl: updatedProfile.linkedinUrl,
          createdAt: updatedProfile.createdAt,
          updatedAt: updatedProfile.updatedAt
        }
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/profile/:userId
 * Allow authenticated users to view another user's public profile
 * Never exposes email, passwordHash, account status, or session details
 */
async function getProfileByUserId(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.userId, 10);

    if (isNaN(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid user ID format'
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        role: true,
        alumniProfile: true
      }
    });

    if (!user || !user.isActive || !user.alumniProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User or profile not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        role: user.role.name,
        fullName: user.alumniProfile.fullName,
        graduationYear: user.alumniProfile.graduationYear,
        department: user.alumniProfile.department,
        currentJobTitle: user.alumniProfile.currentJobTitle,
        currentCompany: user.alumniProfile.currentCompany,
        bio: user.alumniProfile.bio,
        linkedinUrl: user.alumniProfile.linkedinUrl
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId
};

