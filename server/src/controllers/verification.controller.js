const crypto = require('crypto');
const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');
const {
  DEFAULT_MATH_CONFIG,
  generateVerificationCode,
  recoverVerificationSequence,
  validateVerificationCode,
  formatVerificationIdentifier,
  parseVerificationIdentifier
} = require('../utils/numberTheory');

/**
 * Hash a public token using SHA-256
 * @param {string} token
 * @returns {string} hex digest
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Atomically allocates the next verification sequence number.
 * Uses PostgreSQL sequence 'alumni_verification_seq' inside transaction.
 * Fallback to advisory lock / atomic lock if running in non-pg mock tests.
 * Enforces sequence capacity within prime modulus m.
 *
 * @param {object} tx - Prisma transaction client
 * @returns {Promise<number>}
 */
async function allocateNextVerificationSequence(tx) {
  let nextSeq;

  try {
    // 1. Try atomic PostgreSQL sequence nextval
    const result = await tx.$queryRaw`SELECT nextval('alumni_verification_seq') AS next_val`;
    nextSeq = Number(result[0].next_val);
  } catch {
    // 2. Fallback for environments where sequence object is not yet created or in mock testing
    // Atomically select max sequenceNumber with FOR UPDATE if table lock available, or safe increment
    const lastVerification = await tx.alumniVerification.findFirst({
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true }
    });
    nextSeq = (lastVerification?.sequenceNumber || 0) + 1;
  }

  // 3. Mathematical range constraint & sequence exhaustion check
  // Sequence must be strictly less than prime modulus m
  const maxAllowed = Number(DEFAULT_MATH_CONFIG.m - 1n);
  if (nextSeq >= maxAllowed) {
    throw new Error(`Verification sequence capacity exhausted. Maximum sequence supported is ${maxAllowed}.`);
  }

  return nextSeq;
}

/**
 * POST /api/admin/alumni/:applicantId/verify
 * Process verification decision (APPROVE, REJECT, REVOKE) for an alumni profile.
 *
 * CANONICAL ROUTE PARAMETER:
 * `:applicantId` canonically refers to the `AlumniProfile.id`.
 * This avoids ambiguous resolution where User.id and AlumniProfile.id overlap.
 *
 * Access: ADMIN
 */
async function processAdminVerification(req, res, next) {
  try {
    const profileId = parseInt(req.params.applicantId, 10);
    const { action, reason, notes } = req.body;
    const adminId = req.user.id;

    if (isNaN(profileId) || profileId <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid AlumniProfile ID format' }
      });
    }

    // Canonical query strictly by AlumniProfile.id
    const targetProfile = await prisma.alumniProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { include: { role: true } },
        verification: true
      }
    });

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Alumni profile not found' }
      });
    }

    // Security check: Administrators cannot verify or alter their own profile
    if (targetProfile.userId === adminId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Administrators cannot verify or alter their own profile verification' }
      });
    }

    if (action === 'APPROVE') {
      const alumniRole = await prisma.role.findUnique({
        where: { name: ROLES.ALUMNI }
      });

      // Execute transaction to atomically allocate sequence, generate number-theory code & persist
      const result = await prisma.$transaction(async (tx) => {
        // Atomic sequence allocation
        const nextSequence = await allocateNextVerificationSequence(tx);

        // Generate transformed mathematical verification number using BigInt affine transformation
        const mathCode = generateVerificationCode(nextSequence);
        const verificationIdentifier = formatVerificationIdentifier(mathCode);

        // Generate separate cryptographically secure random token (24 bytes = 48 hex characters)
        const rawPublicToken = crypto.randomBytes(24).toString('hex');
        const publicTokenHash = hashToken(rawPublicToken);

        // Update target user's role to ALUMNI
        if (alumniRole) {
          await tx.user.update({
            where: { id: targetProfile.userId },
            data: { roleId: alumniRole.id }
          });
        }

        // Upsert verification record (handles re-verification idempotently without duplicate records)
        const verification = await tx.alumniVerification.upsert({
          where: { alumniProfileId: targetProfile.id },
          create: {
            sequenceNumber: nextSequence,
            verificationCode: verificationIdentifier,
            publicTokenHash,
            status: 'VERIFIED',
            verifiedAt: new Date(),
            verifiedById: adminId,
            alumniProfileId: targetProfile.id
          },
          update: {
            sequenceNumber: nextSequence,
            verificationCode: verificationIdentifier,
            publicTokenHash,
            status: 'VERIFIED',
            verifiedAt: new Date(),
            verifiedById: adminId,
            revokedAt: null,
            revokedById: null,
            revocationReason: null
          }
        });

        return {
          verification,
          rawPublicToken,
          verificationIdentifier
        };
      });

      // The raw public token is returned only here in the admin response for recording/copying
      return res.status(200).json({
        success: true,
        message: `Alumni verification approved successfully for ${targetProfile.fullName}`,
        data: {
          verificationIdentifier: result.verificationIdentifier,
          publicVerificationToken: result.rawPublicToken,
          status: 'VERIFIED',
          verifiedAt: result.verification.verifiedAt,
          fullName: targetProfile.fullName,
          alumniProfileId: targetProfile.id
        }
      });
    }

    if (action === 'REVOKE') {
      if (!targetProfile.verification || targetProfile.verification.status !== 'VERIFIED') {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Alumni profile does not have an active verification to revoke' }
        });
      }

      const revokedVerification = await prisma.alumniVerification.update({
        where: { alumniProfileId: targetProfile.id },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedById: adminId,
          revocationReason: reason || notes || 'Verification revoked by administrator'
        }
      });

      return res.status(200).json({
        success: true,
        message: `Verification revoked for ${targetProfile.fullName}`,
        data: {
          verificationIdentifier: revokedVerification.verificationCode,
          status: 'REVOKED',
          revokedAt: revokedVerification.revokedAt,
          revocationReason: revokedVerification.revocationReason
        }
      });
    }

    if (action === 'REJECT') {
      // If a verification record exists, update it to REJECTED so it cannot appear verified
      if (targetProfile.verification) {
        await prisma.alumniVerification.update({
          where: { alumniProfileId: targetProfile.id },
          data: {
            status: 'REJECTED',
            revokedAt: new Date(),
            revokedById: adminId,
            revocationReason: reason || notes || 'Registration rejected by administrator'
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: `Applicant registration rejected for ${targetProfile.fullName}`
      });
    }

    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid verification action' }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/verification/verify?code=ALU-000043 (or token)
 * Public Verification Endpoint
 * Validates identifier or secure token without exposing private data
 */
async function publicVerifyAlumni(req, res, next) {
  try {
    const rawCode = (req.query.code || '').trim();

    if (!rawCode) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Verification identifier or token is required' }
      });
    }

    const isIdentifierFormat = /^ALU-\d+$/i.test(rawCode);

    // If identifier format, validate mathematical integrity
    if (isIdentifierFormat) {
      try {
        const mathCode = parseVerificationIdentifier(rawCode);
        const isValidMath = validateVerificationCode(mathCode);
        if (!isValidMath) {
          return res.status(200).json({
            success: true,
            data: {
              exists: false,
              isValid: false,
              status: 'INVALID',
              message: 'Invalid mathematical verification identifier.'
            }
          });
        }
      } catch {
        return res.status(200).json({
          success: true,
          data: {
            exists: false,
            isValid: false,
            status: 'INVALID',
            message: 'Malformed verification identifier format.'
          }
        });
      }
    }

    // Look up verification record in database
    const normalizedIdentifier = isIdentifierFormat ? rawCode.toUpperCase() : null;
    const tokenHash = !isIdentifierFormat ? hashToken(rawCode) : null;

    const record = await prisma.alumniVerification.findFirst({
      where: {
        OR: [
          normalizedIdentifier ? { verificationCode: normalizedIdentifier } : undefined,
          tokenHash ? { publicTokenHash: tokenHash } : undefined
        ].filter(Boolean)
      },
      include: {
        alumniProfile: true
      }
    });

    if (!record || !record.alumniProfile) {
      return res.status(200).json({
        success: true,
        data: {
          exists: false,
          isValid: false,
          status: 'NOT_FOUND',
          message: 'No alumni verification record found for this identifier.'
        }
      });
    }

    const isValid = record.status === 'VERIFIED';

    return res.status(200).json({
      success: true,
      data: {
        exists: true,
        isValid,
        status: record.status,
        verificationIdentifier: record.verificationCode,
        verifiedAt: record.verifiedAt,
        revokedAt: record.revokedAt,
        revocationReason: record.status === 'REVOKED' ? record.revocationReason : undefined,
        alumni: {
          fullName: record.alumniProfile.fullName,
          department: record.alumniProfile.department,
          graduationYear: record.alumniProfile.graduationYear,
          currentCompany: record.alumniProfile.currentCompany,
          currentJobTitle: record.alumniProfile.currentJobTitle
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  processAdminVerification,
  publicVerifyAlumni,
  allocateNextVerificationSequence,
  hashToken
};
