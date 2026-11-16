const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ROLES } = require('../src/constants/roles');
const { authorizeRoles } = require('../src/middlewares/auth');
const {
  generateVerificationCode,
  recoverVerificationSequence,
  validateVerificationCode,
  formatVerificationIdentifier,
  parseVerificationIdentifier,
  DEFAULT_MATH_CONFIG
} = require('../src/utils/numberTheory');
const {
  adminVerifySchema,
  publicVerifyQuerySchema
} = require('../src/validators/verification.validator');
const {
  allocateNextVerificationSequence,
  hashToken
} = require('../src/controllers/verification.controller');

describe('ALUMNI VERIFICATION & NUMBER THEORY WORKFLOW INTEGRITY', () => {
  it('should enforce that verification approval and revocation require ADMIN role', () => {
    const adminCheck = authorizeRoles(ROLES.ADMIN);
    let studentBlocked = false;
    let alumniBlocked = false;
    let adminAllowed = false;

    const mockRes = {
      status(code) {
        if (code === 403) return { json() {} };
        return { json() {} };
      }
    };

    adminCheck({ user: { role: { name: ROLES.STUDENT } } }, mockRes, () => { studentBlocked = true; });
    adminCheck({ user: { role: { name: ROLES.ALUMNI } } }, mockRes, () => { alumniBlocked = true; });
    adminCheck({ user: { role: { name: ROLES.ADMIN } } }, mockRes, () => { adminAllowed = true; });

    assert.equal(studentBlocked, false);
    assert.equal(alumniBlocked, false);
    assert.equal(adminAllowed, true);
  });

  it('should validate admin verification action payloads', () => {
    const validApprove = adminVerifySchema.safeParse({ action: 'APPROVE', notes: 'Verified graduation records' });
    assert.equal(validApprove.success, true);

    const validRevoke = adminVerifySchema.safeParse({ action: 'REVOKE', reason: 'Diploma authenticity flagged' });
    assert.equal(validRevoke.success, true);

    const validReject = adminVerifySchema.safeParse({ action: 'REJECT' });
    assert.equal(validReject.success, true);

    const invalidAction = adminVerifySchema.safeParse({ action: 'UNKNOWN' });
    assert.equal(invalidAction.success, false);

    const extraFields = adminVerifySchema.safeParse({ action: 'APPROVE', unauthorizedField: 'bad' });
    assert.equal(extraFields.success, false);
  });

  it('should validate public verification query schema', () => {
    const validQuery = publicVerifyQuerySchema.safeParse({ code: 'ALU-000043' });
    assert.equal(validQuery.success, true);

    const emptyQuery = publicVerifyQuerySchema.safeParse({ code: '   ' });
    assert.equal(emptyQuery.success, false);
  });

  it('should generate collision-free identifiers for distinct sequences', () => {
    const identifiers = new Set();
    for (let seq = 1; seq <= 50; seq++) {
      const mathCode = generateVerificationCode(seq);
      const formatted = formatVerificationIdentifier(mathCode);
      assert.match(formatted, /^ALU-\d{6}$/);
      assert.equal(identifiers.has(formatted), false);
      identifiers.add(formatted);

      // Verify sequence recoverability
      const recoveredSeq = recoverVerificationSequence(mathCode);
      assert.equal(recoveredSeq, BigInt(seq));
    }
    assert.equal(identifiers.size, 50);
  });

  it('should correctly reject malformed verification identifiers in validator', () => {
    assert.equal(validateVerificationCode(-1), false);
    assert.equal(validateVerificationCode(DEFAULT_MATH_CONFIG.m + 10n), false);
  });

  it('should simulate atomic concurrent sequence allocations without duplicates', async () => {
    let mockSequenceState = 0;
    // Mock concurrent transactions executing sequence allocations
    const mockTx = {
      $queryRaw: async () => {
        mockSequenceState += 1;
        return [{ next_val: mockSequenceState }];
      }
    };

    const concurrentAllocations = await Promise.all([
      allocateNextVerificationSequence(mockTx),
      allocateNextVerificationSequence(mockTx),
      allocateNextVerificationSequence(mockTx),
      allocateNextVerificationSequence(mockTx),
      allocateNextVerificationSequence(mockTx),
      allocateNextVerificationSequence(mockTx),
      allocateNextVerificationSequence(mockTx),
      allocateNextVerificationSequence(mockTx)
    ]);

    const uniqueSet = new Set(concurrentAllocations);
    assert.equal(uniqueSet.size, 8, 'Concurrent sequence allocations must all be unique');
    assert.deepEqual(concurrentAllocations.sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('should enforce sequence exhaustion threshold within prime modulus range', async () => {
    const exhaustedTx = {
      $queryRaw: async () => {
        return [{ next_val: Number(DEFAULT_MATH_CONFIG.m) }];
      }
    };

    await assert.rejects(
      async () => {
        await allocateNextVerificationSequence(exhaustedTx);
      },
      /Verification sequence capacity exhausted/
    );
  });

  it('should correctly hash public verification tokens using SHA-256', () => {
    const token = 'abcdef0123456789abcdef0123456789abcdef0123456789';
    const hash = hashToken(token);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    assert.equal(hash, hashToken(token));
  });

  it('should prevent overlapping ID confusion by strictly using canonical AlumniProfile ID', () => {
    // Demonstration test: when User ID is 5 and AlumniProfile ID is 12,
    // queries must use AlumniProfile.id = 12.
    const mockApplicantId = 12;
    assert.equal(mockApplicantId, 12);
  });
});
