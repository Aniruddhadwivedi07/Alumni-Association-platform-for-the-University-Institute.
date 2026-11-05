const prisma = require('../prisma');

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

    // Attach fresh user record to request for route handlers
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAuth
};

