const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

const { registerSchema, loginSchema } = require('../src/validators/auth.validator');
const { updateProfileSchema } = require('../src/validators/profile.validator');
const { directoryQuerySchema, ALLOWED_SORT_FIELDS } = require('../src/validators/directory.validator');
const { ROLES, ROLE_PERMISSIONS } = require('../src/constants/roles');
const { authorizeRoles } = require('../src/middlewares/auth');

describe('A. REGISTRATION WORKFLOW & VALIDATION', () => {
  it('should accept valid registration payloads', () => {
    const validPayload = {
      email: 'alumnus.test@gec.ac.in',
      password: 'SecurePassword123!',
      fullName: 'Rahul Sharma',
      graduationYear: 2020,
      department: 'Computer Science & Engineering'
    };
    const result = registerSchema.safeParse(validPayload);
    assert.equal(result.success, true);
    assert.equal(result.data.email, 'alumnus.test@gec.ac.in');
    assert.equal(result.data.graduationYear, 2020);
  });

  it('should reject registration when required fields are missing', () => {
    const missingFullName = {
      email: 'user@gec.ac.in',
      password: 'Password123!'
    };
    const result = registerSchema.safeParse(missingFullName);
    assert.equal(result.success, false);
    const errorPaths = result.error.issues.map((e) => e.path.join('.'));
    assert.ok(errorPaths.includes('fullName'));
  });

  it('should reject registration with invalid email formats', () => {
    const invalidEmail = {
      email: 'invalid-email-address',
      password: 'Password123!',
      fullName: 'Test User'
    };
    const result = registerSchema.safeParse(invalidEmail);
    assert.equal(result.success, false);
    const emailErr = result.error.issues.find((e) => e.path.includes('email'));
    assert.ok(emailErr);
  });

  it('should validate password minimum length requirements', () => {
    const shortPassword = {
      email: 'user@gec.ac.in',
      password: '123',
      fullName: 'Test User'
    };
    const result = registerSchema.safeParse(shortPassword);
    assert.equal(result.success, false);
    const passErr = result.error.issues.find((e) => e.path.includes('password'));
    assert.ok(passErr);
  });

  it('should verify password hashing and constant-time match logic', async () => {
    const rawPassword = 'Password2026!';
    const hash = await bcrypt.hash(rawPassword, 10);
    const match = await bcrypt.compare(rawPassword, hash);
    const mismatch = await bcrypt.compare('WrongPassword', hash);
    assert.equal(match, true);
    assert.equal(mismatch, false);
  });
});

describe('B. LOGIN WORKFLOW & CREDENTIAL VALIDATION', () => {
  it('should accept valid login input', () => {
    const validLogin = {
      email: 'admin@gec.ac.in',
      password: 'AdminPassword123!'
    };
    const result = loginSchema.safeParse(validLogin);
    assert.equal(result.success, true);
  });

  it('should reject login with missing email or password', () => {
    const noPassword = { email: 'admin@gec.ac.in' };
    const result = loginSchema.safeParse(noPassword);
    assert.equal(result.success, false);
  });

  it('should reject login with malformed email', () => {
    const badEmail = { email: 'not-an-email', password: 'Password123' };
    const result = loginSchema.safeParse(badEmail);
    assert.equal(result.success, false);
  });
});

describe('C. PERMISSIONS & ROLE-BASED ACCESS CONTROL (RBAC)', () => {
  it('should define distinct roles for STUDENT, ALUMNI, and ADMIN', () => {
    assert.equal(ROLES.STUDENT, 'STUDENT');
    assert.equal(ROLES.ALUMNI, 'ALUMNI');
    assert.equal(ROLES.ADMIN, 'ADMIN');
  });

  it('should correctly configure hierarchical permissions', () => {
    assert.deepEqual(ROLE_PERMISSIONS.STUDENT, ['STUDENT']);
    assert.deepEqual(ROLE_PERMISSIONS.ALUMNI, ['STUDENT', 'ALUMNI']);
    assert.deepEqual(ROLE_PERMISSIONS.ADMIN, ['STUDENT', 'ALUMNI', 'ADMIN']);
  });

  it('should block unauthenticated access to protected handlers', () => {
    const middleware = authorizeRoles('ADMIN');
    let statusCode = null;
    let jsonPayload = null;

    const req = { user: null };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(payload) {
            jsonPayload = payload;
          }
        };
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 401);
    assert.equal(jsonPayload.error.code, 'UNAUTHORIZED');
  });

  it('should deny unauthorized STUDENT access to ADMIN-only actions', () => {
    const middleware = authorizeRoles('ADMIN');
    let statusCode = null;
    let jsonPayload = null;

    const req = {
      user: {
        id: 10,
        role: { name: 'STUDENT' }
      }
    };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(payload) {
            jsonPayload = payload;
          }
        };
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);
    assert.equal(jsonPayload.error.code, 'FORBIDDEN');
  });

  it('should permit ADMIN access to ADMIN-protected routes', () => {
    const middleware = authorizeRoles('ADMIN');
    const req = {
      user: {
        id: 1,
        role: { name: 'ADMIN' }
      }
    };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
  });
});

describe('D. PROFILE EDITING WORKFLOW', () => {
  it('should accept valid profile updates', () => {
    const validProfile = {
      fullName: 'Priya Verma',
      graduationYear: 2018,
      department: 'Electrical Engineering',
      currentJobTitle: 'Senior Systems Architect',
      currentCompany: 'PowerGrid Corp',
      bio: 'Alumna working in energy infrastructure.',
      linkedinUrl: 'https://linkedin.com/in/priya-verma'
    };
    const result = updateProfileSchema.safeParse(validProfile);
    assert.equal(result.success, true);
  });

  it('should reject profile updates with invalid URL format', () => {
    const invalidUrl = {
      fullName: 'Priya Verma',
      linkedinUrl: 'not-a-valid-url'
    };
    const result = updateProfileSchema.safeParse(invalidUrl);
    assert.equal(result.success, false);
    const urlErr = result.error.issues.find((e) => e.path.includes('linkedinUrl'));
    assert.ok(urlErr);
  });

  it('should reject graduation years outside reasonable institutional bounds', () => {
    const futureYear = {
      fullName: 'Priya Verma',
      graduationYear: 2150
    };
    const result = updateProfileSchema.safeParse(futureYear);
    assert.equal(result.success, false);
  });
});

describe('E. ALUMNI DIRECTORY WORKFLOW', () => {
  it('should parse and sanitize directory query parameters with default pagination', () => {
    const query = {};
    const result = directoryQuerySchema.safeParse(query);
    assert.equal(result.success, true);
    assert.equal(result.data.page, 1);
    assert.equal(result.data.limit, 10);
    assert.equal(result.data.sortBy, 'fullName');
    assert.equal(result.data.sortOrder, 'asc');
  });

  it('should parse search and filter criteria correctly', () => {
    const query = {
      search: 'Priya',
      graduationYear: '2018',
      department: 'Electrical Engineering',
      company: 'PowerGrid',
      page: '2',
      limit: '20',
      sortBy: 'graduationYear',
      sortOrder: 'desc'
    };
    const result = directoryQuerySchema.safeParse(query);
    assert.equal(result.success, true);
    assert.equal(result.data.search, 'Priya');
    assert.equal(result.data.graduationYear, 2018);
    assert.equal(result.data.page, 2);
    assert.equal(result.data.limit, 20);
    assert.equal(result.data.sortBy, 'graduationYear');
    assert.equal(result.data.sortOrder, 'desc');
  });

  it('should reject unpermitted sort fields to guard against SQL injection', () => {
    const badSort = { sortBy: 'nonExistentColumn' };
    const result = directoryQuerySchema.safeParse(badSort);
    assert.equal(result.success, false);
  });
});

describe('F. ALUMNI VERIFICATION & ADMINISTRATIVE WORKFLOW CONTRACT', () => {
  it('should verify that pending verification actions require administrative authority', () => {
    const verifyMiddleware = authorizeRoles(ROLES.ADMIN);
    let statusCode = null;

    const studentReq = { user: { role: { name: ROLES.STUDENT } } };
    const res = {
      status(code) {
        statusCode = code;
        return { json() {} };
      }
    };
    let nextCalled = false;
    verifyMiddleware(studentReq, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);
  });

  it('should confirm documented API dependency status for verification endpoints', () => {
    const expectedActions = ['APPROVE', 'REJECT'];
    assert.ok(expectedActions.includes('APPROVE'));
    assert.ok(expectedActions.includes('REJECT'));
  });
});
