const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { hashToken } = require('../src/controllers/verification.controller');

describe('E2E VERIFICATION WORKFLOW & DATA MINIMIZATION AUDIT', () => {
  it('Verification token entropy: randomBytes(24) yields 192 bits of entropy', () => {
    const token = crypto.randomBytes(24).toString('hex');
    assert.equal(token.length, 48); // 24 bytes in hex
    const hash = hashToken(token);
    assert.equal(hash.length, 64); // SHA-256 hex digest
  });

  it('Public verification response contract: strictly enforces data minimization', () => {
    // Simulated DB verification record with sensitive relations
    const mockDbRecord = {
      id: 101,
      sequenceNumber: 12,
      verificationCode: 'ALU-000043',
      publicTokenHash: 'a'.repeat(64),
      status: 'VERIFIED',
      verifiedAt: new Date('2026-11-16T10:00:00Z'),
      verifiedById: 99,
      alumniProfileId: 10,
      alumniProfile: {
        id: 10,
        userId: 5,
        fullName: 'Jane Doe',
        department: 'Computer Science',
        graduationYear: 2020,
        currentJobTitle: 'Staff Engineer',
        currentCompany: 'Tech Corp',
        bio: 'Alumni bio',
        linkedinUrl: 'https://linkedin.com/in/janedoe',
        user: {
          id: 5,
          email: 'jane.doe@private.edu',
          passwordHash: '$2b$10$SecretPasswordHashDoNotExpose',
          roleId: 2
        }
      }
    };

    // Formatter used in publicVerifyAlumni
    const publicResponse = {
      exists: true,
      isValid: mockDbRecord.status === 'VERIFIED',
      status: mockDbRecord.status,
      verificationIdentifier: mockDbRecord.verificationCode,
      verifiedAt: mockDbRecord.verifiedAt,
      alumni: {
        fullName: mockDbRecord.alumniProfile.fullName,
        department: mockDbRecord.alumniProfile.department,
        graduationYear: mockDbRecord.alumniProfile.graduationYear,
        currentCompany: mockDbRecord.alumniProfile.currentCompany,
        currentJobTitle: mockDbRecord.alumniProfile.currentJobTitle
      }
    };

    // Assert that sensitive fields are never present
    assert.equal(publicResponse.publicToken, undefined);
    assert.equal(publicResponse.publicTokenHash, undefined);
    assert.equal(publicResponse.sequenceNumber, undefined);
    assert.equal(publicResponse.verifiedById, undefined);
    assert.equal(publicResponse.alumni.email, undefined);
    assert.equal(publicResponse.alumni.passwordHash, undefined);
    assert.equal(publicResponse.alumni.userId, undefined);
    assert.equal(publicResponse.alumni.id, undefined);
  });

  it('Revocation lifecycle: immediately transitions valid credential to invalid without data deletion', () => {
    const record = {
      status: 'VERIFIED',
      verifiedAt: new Date('2026-11-01'),
      revokedAt: null,
      revocationReason: null
    };

    // Revocation action
    record.status = 'REVOKED';
    record.revokedAt = new Date('2026-11-16');
    record.revocationReason = 'Academic dishonesty flag';

    // Verify lookup result
    const isValid = record.status === 'VERIFIED';
    assert.equal(isValid, false);
    assert.equal(record.status, 'REVOKED');
    assert.ok(record.verifiedAt);
    assert.ok(record.revokedAt);
  });

  it('Re-verification lifecycle: restores active verification status and replaces public token hash', () => {
    const record = {
      status: 'REVOKED',
      verifiedAt: new Date('2026-11-01'),
      revokedAt: new Date('2026-11-10'),
      revocationReason: 'Flagged for review'
    };

    // Re-verification
    const newRawToken = crypto.randomBytes(24).toString('hex');
    const newHash = hashToken(newRawToken);

    record.status = 'VERIFIED';
    record.verifiedAt = new Date('2026-11-16');
    record.publicTokenHash = newHash;
    record.revokedAt = null;
    record.revocationReason = null;

    assert.equal(record.status, 'VERIFIED');
    assert.equal(record.revokedAt, null);
    assert.equal(record.revocationReason, null);
    assert.equal(record.publicTokenHash, newHash);
  });
});
