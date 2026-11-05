const bcrypt = require('bcrypt');
const prisma = require('../prisma');

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { email, password, fullName, graduationYear, department } = req.body;

    // Normalize email (redundant safety with validator, guarantees trim & lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Look up the default STUDENT role
    const studentRole = await prisma.role.findUnique({
      where: { name: 'STUDENT' }
    });

    if (!studentRole) {
      console.error('Registration failed: Default STUDENT role does not exist in database');
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Server configuration error: default role not found'
        }
      });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A user with this email address already exists'
        }
      });
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create User and AlumniProfile atomically in a single nested write / transaction
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        roleId: studentRole.id,
        // isActive defaults to true per schema
        alumniProfile: {
          create: {
            fullName: fullName.trim(),
            graduationYear: graduationYear ?? null,
            department: department ? department.trim() : null
          }
        }
      },
      include: {
        role: true,
        alumniProfile: true
      }
    });

    // Return safe account and profile fields (no password or passwordHash)
    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role.name,
        isActive: newUser.isActive,
        profile: {
          id: newUser.alumniProfile.id,
          fullName: newUser.alumniProfile.fullName,
          graduationYear: newUser.alumniProfile.graduationYear,
          department: newUser.alumniProfile.department
        },
        createdAt: newUser.createdAt
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    // Handle Prisma unique constraint violation (code P2002) if concurrent requests slip through
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A user with this email address already exists'
        }
      });
    }

    // Forward unexpected errors to centralized error handler without leaking DB details
    next(error);
  }
}

module.exports = {
  register
};

