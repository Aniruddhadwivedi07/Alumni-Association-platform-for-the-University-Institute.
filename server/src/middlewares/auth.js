const prisma = require('../prisma');
const { ROLE_PERMISSIONS } = require('../constants/roles');

async function requireAuth(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        role: true,
        alumniProfile: true
      }
    });

    if (!user || !user.isActive) {
      // Destroy invalid/inactive session
      if (req.session) {
        req.session.destroy(() => {});
      }
      res.clearCookie('sid');

      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account is inactive or no longer exists'
        }
      });
    }

    // Attach fresh user record to request for route handlers and authorizeRoles
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authorization middleware for RBAC.
 * Accepts one or more allowed roles as separate arguments or as an array.
 * Validates the user's freshly fetched database role against allowed roles.
 *
 * Usage:
 *   authorizeRoles('ADMIN')
 *   authorizeRoles('ALUMNI', 'ADMIN')
 *   authorizeRoles(['ALUMNI', 'ADMIN'])
 */
function authorizeRoles(...allowedRoles) {
  // Flatten in case an array or mixed parameters were passed
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    // 1. Must be authenticated first
    if (!req.user || !req.user.role || !req.user.role.name) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const userRole = req.user.role.name;

    // Check direct role membership or hierarchical permission grant
    const effectiveRoles = ROLE_PERMISSIONS[userRole] || [userRole];
    const isAuthorized = roles.some((role) => effectiveRoles.includes(role));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: insufficient permissions'
        }
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  authorizeRoles
};
