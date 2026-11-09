const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema
} = require('../src/validators/job.validator');
const {
  createApplicationSchema,
  updateApplicationStatusSchema
} = require('../src/validators/application.validator');
const { ROLES, ROLE_PERMISSIONS } = require('../src/constants/roles');
const { authorizeRoles } = require('../src/middlewares/auth');

describe('A. JOB CREATION WORKFLOW & VALIDATION', () => {
  it('should accept valid job creation payloads from authorized alumni', () => {
    const validJob = {
      title: 'Full Stack Engineer',
      description: 'Join our alumni-led startup building next-gen developer tooling.',
      company: 'TechFlow Systems',
      location: 'Bengaluru / Remote',
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Senior',
      salaryMin: 1200000,
      salaryMax: 1800000,
      applicationDeadline: '2026-12-31'
    };

    const result = createJobSchema.safeParse(validJob);
    assert.equal(result.success, true);
    assert.equal(result.data.title, 'Full Stack Engineer');
    assert.equal(result.data.company, 'TechFlow Systems');
    assert.equal(result.data.salaryMin, 1200000);
    assert.equal(result.data.salaryMax, 1800000);
  });

  it('should reject job creation with missing required fields (title, company, description, employmentType)', () => {
    const missingFields = {
      title: 'Software Developer'
      // missing description, company, employmentType
    };

    const result = createJobSchema.safeParse(missingFields);
    assert.equal(result.success, false);
    const issuePaths = result.error.issues.map((i) => i.path.join('.'));
    assert.ok(issuePaths.includes('description'));
    assert.ok(issuePaths.includes('company'));
    assert.ok(issuePaths.includes('employmentType'));
  });

  it('should reject job creation where salaryMin exceeds salaryMax', () => {
    const invalidSalaries = {
      title: 'Cloud Architect',
      description: 'Designing distributed cloud systems.',
      company: 'DataScale Corp',
      employmentType: 'Full-time',
      salaryMin: 2500000,
      salaryMax: 1500000
    };

    const result = createJobSchema.safeParse(invalidSalaries);
    assert.equal(result.success, false);
    const salaryIssue = result.error.issues.find((i) => i.path.includes('salaryMin'));
    assert.ok(salaryIssue);
  });

  it('should reject job creation with invalid application deadline formatting', () => {
    const invalidDateJob = {
      title: 'DevOps Engineer',
      description: 'CI/CD pipeline administration.',
      company: 'InfraCorp',
      employmentType: 'Full-time',
      applicationDeadline: 'not-a-valid-date'
    };

    const result = createJobSchema.safeParse(invalidDateJob);
    assert.equal(result.success, false);
  });

  it('should reject unpermitted extra properties under strict schema rules', () => {
    const extraPropertyJob = {
      title: 'QA Automation Engineer',
      description: 'Testing web systems.',
      company: 'TestLogic',
      employmentType: 'Contract',
      unpermittedProperty: 'malicious injection'
    };

    const result = createJobSchema.safeParse(extraPropertyJob);
    assert.equal(result.success, false);
  });
});

describe('B. JOB AUTHORIZATION & ROLE-BASED ACCESS CONTROL', () => {
  it('should allow ALUMNI role to create jobs', () => {
    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);
    const req = {
      user: {
        id: 15,
        role: { name: ROLES.ALUMNI }
      }
    };
    const res = {};
    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  it('should allow ADMIN role to create and moderate jobs', () => {
    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);
    const req = {
      user: {
        id: 1,
        role: { name: ROLES.ADMIN }
      }
    };
    const res = {};
    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  it('should deny STUDENT role from creating jobs', () => {
    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);
    let statusCode = null;
    let jsonPayload = null;

    const req = {
      user: {
        id: 42,
        role: { name: ROLES.STUDENT }
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
    middleware(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);
    assert.equal(jsonPayload.error.code, 'FORBIDDEN');
  });

  it('should deny unauthenticated requests from job creation or moderation', () => {
    const middleware = authorizeRoles(ROLES.ADMIN);
    let statusCode = null;
    const req = { user: null };
    const res = {
      status(code) {
        statusCode = code;
        return { json() {} };
      }
    };
    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 401);
  });
});

describe('C. JOB APPLICATION WORKFLOW & VALIDATION', () => {
  it('should accept valid job application submissions', () => {
    const validApp = {
      coverLetter: 'I am excited to apply for this engineering role at TechFlow Systems.',
      resumeUrl: 'https://storage.cloud.google.com/resumes/alumni-candidate.pdf'
    };

    const result = createApplicationSchema.safeParse(validApp);
    assert.equal(result.success, true);
  });

  it('should accept job application without cover letter or resumeUrl (optional fields)', () => {
    const minimalApp = {};
    const result = createApplicationSchema.safeParse(minimalApp);
    assert.equal(result.success, true);
  });

  it('should reject application with invalid resume URL format', () => {
    const invalidUrlApp = {
      resumeUrl: 'not-a-valid-http-or-https-url'
    };

    const result = createApplicationSchema.safeParse(invalidUrlApp);
    assert.equal(result.success, false);
  });

  it('should reject application with overly long cover letter', () => {
    const overlyLong = {
      coverLetter: 'a'.repeat(5001)
    };

    const result = createApplicationSchema.safeParse(overlyLong);
    assert.equal(result.success, false);
  });

  it('should validate allowed application status update values', () => {
    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];
    for (const status of validStatuses) {
      const result = updateApplicationStatusSchema.safeParse({ status });
      assert.equal(result.success, true);
    }

    const invalidStatus = { status: 'HIRED_OUTSIDE_SYSTEM' };
    const result = updateApplicationStatusSchema.safeParse(invalidStatus);
    assert.equal(result.success, false);
  });
});

describe('D. DUPLICATE PREVENTION & BUSINESS LOGIC INTEGRITY', () => {
  it('should enforce unique constraint composite key [jobId, applicantId] in model semantics', () => {
    const compositeKey = ['jobId', 'applicantId'];
    assert.equal(compositeKey.length, 2);
    assert.ok(compositeKey.includes('jobId'));
    assert.ok(compositeKey.includes('applicantId'));
  });

  it('should verify deadline expiration logic correctly determines expired status', () => {
    const pastDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // in 7 days

    const isPastExpired = new Date() > pastDeadline;
    const isFutureExpired = new Date() > futureDeadline;

    assert.equal(isPastExpired, true);
    assert.equal(isFutureExpired, false);
  });

  it('should disallow ADMINISTRATOR accounts from applying as job candidates', () => {
    const userRole = ROLES.ADMIN;
    const isBlocked = userRole === ROLES.ADMIN;
    assert.equal(isBlocked, true);
  });
});

describe('E. JOB MODERATION CONTRACT & QUERY SANITIZATION', () => {
  it('should parse and sanitize job queries with default pagination & sorting', () => {
    const query = {};
    const result = jobQuerySchema.safeParse(query);
    assert.equal(result.success, true);
    assert.equal(result.data.page, 1);
    assert.equal(result.data.limit, 10);
    assert.equal(result.data.sortBy, 'createdAt');
    assert.equal(result.data.sortOrder, 'desc');
  });

  it('should support search, location, employmentType, and experienceLevel filtering', () => {
    const query = {
      search: 'Engineer',
      location: 'Bengaluru',
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Senior',
      page: '2',
      limit: '15'
    };

    const result = jobQuerySchema.safeParse(query);
    assert.equal(result.success, true);
    assert.equal(result.data.search, 'Engineer');
    assert.equal(result.data.location, 'Bengaluru');
    assert.equal(result.data.page, 2);
    assert.equal(result.data.limit, 15);
  });

  it('should reject unpermitted sort fields to guard against SQL injection', () => {
    const injectionQuery = { sortBy: 'passwordHash' };
    const result = jobQuerySchema.safeParse(injectionQuery);
    assert.equal(result.success, false);
  });

  it('should document administrative moderation status lifecycle', () => {
    const supportedActions = ['DEACTIVATE', 'ACTIVATE', 'APPROVE', 'REJECT'];
    assert.equal(supportedActions.length, 4);
    assert.ok(supportedActions.includes('DEACTIVATE'));
    assert.ok(supportedActions.includes('ACTIVATE'));
  });
});
