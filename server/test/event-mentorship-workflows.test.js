const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema
} = require('../src/validators/event.validator');
const {
  createMentorshipRequestSchema,
  mentorshipQuerySchema,
  updateMentorshipStatusSchema
} = require('../src/validators/mentorship.validator');
const {
  registrationPaginationQuerySchema
} = require('../src/validators/registration.validator');
const { ROLES } = require('../src/constants/roles');
const { authorizeRoles } = require('../src/middlewares/auth');

// ─── A. EVENT CREATION & VALIDATION WORKFLOW ─────────────────────────────────

describe('A. EVENT CREATION & VALIDATION WORKFLOW', () => {
  it('should accept valid event creation payload from authorized alumni/admin', () => {
    const validEvent = {
      title: 'Annual Alumni Homecoming 2026',
      description: 'Reconnect with fellow graduates, network with faculty, and celebrate achievements.',
      location: 'University Auditorium, Main Campus',
      startDate: '2026-11-20T10:00:00Z',
      endDate: '2026-11-20T18:00:00Z',
      registrationDeadline: '2026-11-19T23:59:59Z',
      capacity: 250
    };

    const result = createEventSchema.safeParse(validEvent);
    assert.equal(result.success, true);
    assert.equal(result.data.title, 'Annual Alumni Homecoming 2026');
    assert.equal(result.data.capacity, 250);
  });

  it('should accept event creation with YYYY-MM-DD date formats', () => {
    const validEvent = {
      title: 'Webinar: Careers in Machine Learning',
      description: 'Panel discussion featuring alumni leaders at top AI research labs.',
      startDate: '2026-12-01',
      endDate: '2026-12-02'
    };

    const result = createEventSchema.safeParse(validEvent);
    assert.equal(result.success, true);
  });

  it('should reject event creation when required fields are missing', () => {
    const missingFields = {
      location: 'Online'
    };

    const result = createEventSchema.safeParse(missingFields);
    assert.equal(result.success, false);
    const paths = result.error.issues.map((i) => i.path.join('.'));
    assert.ok(paths.includes('title'));
    assert.ok(paths.includes('description'));
    assert.ok(paths.includes('startDate'));
    assert.ok(paths.includes('endDate'));
  });

  it('should reject event creation when endDate is before or equal to startDate', () => {
    const invalidDates = {
      title: 'Startup Pitch Day',
      description: 'Showcasing student and alumni startup ventures.',
      startDate: '2026-11-20T18:00:00Z',
      endDate: '2026-11-20T10:00:00Z'
    };

    const result = createEventSchema.safeParse(invalidDates);
    assert.equal(result.success, false);
    const issues = result.error.issues.filter((i) => i.path.includes('endDate'));
    assert.ok(issues.length > 0);
  });

  it('should reject event creation when registrationDeadline is later than startDate', () => {
    const invalidDeadline = {
      title: 'Networking Dinner',
      description: 'An evening of dinner and professional discussions.',
      startDate: '2026-11-20T18:00:00Z',
      endDate: '2026-11-20T22:00:00Z',
      registrationDeadline: '2026-11-21T00:00:00Z'
    };

    const result = createEventSchema.safeParse(invalidDeadline);
    assert.equal(result.success, false);
    const issues = result.error.issues.filter((i) => i.path.includes('registrationDeadline'));
    assert.ok(issues.length > 0);
  });

  it('should reject event creation with non-positive or non-integer capacity', () => {
    const invalidCapacity = {
      title: 'Hackathon 2026',
      description: '48-hour student hackathon.',
      startDate: '2026-11-20T10:00:00Z',
      endDate: '2026-11-22T18:00:00Z',
      capacity: -10
    };

    const result = createEventSchema.safeParse(invalidCapacity);
    assert.equal(result.success, false);
  });
});

// ─── B. EVENT UPDATE & QUERY WORKFLOW ────────────────────────────────────────

describe('B. EVENT UPDATE & QUERY WORKFLOW', () => {
  it('should validate partial event update payload', () => {
    const updatePayload = {
      title: 'Updated Alumni Gala Night',
      capacity: 300
    };

    const result = updateEventSchema.safeParse(updatePayload);
    assert.equal(result.success, true);
    assert.equal(result.data.title, 'Updated Alumni Gala Night');
    assert.equal(result.data.capacity, 300);
  });

  it('should reject empty event update payload with no fields', () => {
    const emptyPayload = {};

    const result = updateEventSchema.safeParse(emptyPayload);
    assert.equal(result.success, false);
  });

  it('should validate event query parameters with defaults', () => {
    const query = {
      search: 'reunion',
      upcoming: 'true',
      page: '1',
      limit: '20'
    };

    const result = eventQuerySchema.safeParse(query);
    assert.equal(result.success, true);
    assert.equal(result.data.search, 'reunion');
    assert.equal(result.data.page, 1);
    assert.equal(result.data.limit, 20);
    assert.equal(result.data.sortBy, 'startDate');
  });

  it('should reject invalid sort field in event query to protect against injection', () => {
    const invalidQuery = {
      sortBy: 'unauthorized_column; DROP TABLE events;'
    };

    const result = eventQuerySchema.safeParse(invalidQuery);
    assert.equal(result.success, false);
  });

  it('should validate registration pagination schema within page limits', () => {
    const validPagination = { page: '2', limit: '25' };
    const result = registrationPaginationQuerySchema.safeParse(validPagination);
    assert.equal(result.success, true);
    assert.equal(result.data.page, 2);
    assert.equal(result.data.limit, 25);
  });

  it('should reject registration pagination queries exceeding MAX_PAGE_SIZE (50)', () => {
    const excessiveLimit = { page: '1', limit: '100' };
    const result = registrationPaginationQuerySchema.safeParse(excessiveLimit);
    assert.equal(result.success, false);
  });
});

// ─── C. EVENT ROLE-BASED ACCESS CONTROL (RBAC) ───────────────────────────────

describe('C. EVENT ROLE-BASED ACCESS CONTROL (RBAC)', () => {
  function createMockContext(roleName) {
    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const req = {
      user: roleName ? { id: 1, role: { name: roleName } } : null
    };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            jsonBody = body;
          }
        };
      }
    };
    const next = () => {
      nextCalled = true;
    };

    return { req, res, next, getStatus: () => statusCode, getBody: () => jsonBody, wasNextCalled: () => nextCalled };
  }

  it('should allow ADMIN role to create and manage events', () => {
    const ctx = createMockContext(ROLES.ADMIN);
    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);
    middleware(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('should allow ALUMNI role to create events', () => {
    const ctx = createMockContext(ROLES.ALUMNI);
    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);
    middleware(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('should deny STUDENT role from creating events', () => {
    const ctx = createMockContext(ROLES.STUDENT);
    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);
    middleware(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), false);
    assert.equal(ctx.getStatus(), 403);
  });
});

// ─── D. MENTORSHIP REQUEST VALIDATION & LIFECYCLE ────────────────────────────

describe('D. MENTORSHIP REQUEST VALIDATION & LIFECYCLE', () => {
  it('should accept valid mentorship request creation from students', () => {
    const validRequest = {
      mentorId: 42,
      message: 'Hello, I am seeking guidance on cloud infrastructure careers and open-source contributions.'
    };

    const result = createMentorshipRequestSchema.safeParse(validRequest);
    assert.equal(result.success, true);
    assert.equal(result.data.mentorId, 42);
    assert.equal(typeof result.data.message, 'string');
  });

  it('should accept mentorship request where mentorId is provided as numeric string', () => {
    const validRequest = {
      mentorId: '15',
      message: 'Looking for advice on preparing for tech interviews.'
    };

    const result = createMentorshipRequestSchema.safeParse(validRequest);
    assert.equal(result.success, true);
    assert.equal(result.data.mentorId, 15);
  });

  it('should reject mentorship request missing mentorId', () => {
    const missingMentor = {
      message: 'Can you mentor me?'
    };

    const result = createMentorshipRequestSchema.safeParse(missingMentor);
    assert.equal(result.success, false);
  });

  it('should reject mentorship request with non-positive mentorId', () => {
    const invalidId = {
      mentorId: -5,
      message: 'Hello'
    };

    const result = createMentorshipRequestSchema.safeParse(invalidId);
    assert.equal(result.success, false);
  });

  it('should validate mentorship status updates for ACCEPTED, REJECTED, and COMPLETED', () => {
    const validStatuses = ['ACCEPTED', 'REJECTED', 'COMPLETED'];
    for (const status of validStatuses) {
      const result = updateMentorshipStatusSchema.safeParse({ status });
      assert.equal(result.success, true, `Status ${status} should be valid`);
      assert.equal(result.data.status, status);
    }
  });

  it('should reject unauthorized mentorship status transitions like CANCELLED or PENDING via update schema', () => {
    const invalidStatuses = ['CANCELLED', 'PENDING', 'UNKNOWN', 'DELETED'];
    for (const status of invalidStatuses) {
      const result = updateMentorshipStatusSchema.safeParse({ status });
      assert.equal(result.success, false, `Status ${status} should not be allowed in update schema`);
    }
  });

  it('should validate query filters for mentorship requests', () => {
    const query = {
      status: 'PENDING',
      page: '1',
      limit: '15'
    };

    const result = mentorshipQuerySchema.safeParse(query);
    assert.equal(result.success, true);
    assert.equal(result.data.status, 'PENDING');
    assert.equal(result.data.limit, 15);
  });

  it('should reject mentorship queries with invalid status values', () => {
    const invalidQuery = {
      status: 'INVALID_STATUS'
    };

    const result = mentorshipQuerySchema.safeParse(invalidQuery);
    assert.equal(result.success, false);
  });
});

// ─── E. MENTORSHIP ROLE-BASED ACCESS CONTROL ─────────────────────────────────

describe('E. MENTORSHIP ROLE-BASED ACCESS CONTROL (RBAC)', () => {
  function createMockContext(roleName) {
    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const req = {
      user: roleName ? { id: 2, role: { name: roleName } } : null
    };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            jsonBody = body;
          }
        };
      }
    };
    const next = () => {
      nextCalled = true;
    };

    return { req, res, next, getStatus: () => statusCode, getBody: () => jsonBody, wasNextCalled: () => nextCalled };
  }

  it('should allow STUDENT, ALUMNI, and ADMIN to create mentorship requests via hierarchical role model', () => {
    const studentCtx = createMockContext(ROLES.STUDENT);
    const middleware = authorizeRoles(ROLES.STUDENT);
    middleware(studentCtx.req, studentCtx.res, studentCtx.next);
    assert.equal(studentCtx.wasNextCalled(), true);

    const alumniCtx = createMockContext(ROLES.ALUMNI);
    middleware(alumniCtx.req, alumniCtx.res, alumniCtx.next);
    assert.equal(alumniCtx.wasNextCalled(), true);
  });

  it('should deny unauthenticated requests from creating mentorship requests', () => {
    const unauthCtx = createMockContext(null);
    const middleware = authorizeRoles(ROLES.STUDENT);
    middleware(unauthCtx.req, unauthCtx.res, unauthCtx.next);
    assert.equal(unauthCtx.wasNextCalled(), false);
    assert.equal(unauthCtx.getStatus(), 401);
  });

  it('should allow ALUMNI and ADMIN roles to view received mentorship requests', () => {
    const alumniCtx = createMockContext(ROLES.ALUMNI);
    const adminCtx = createMockContext(ROLES.ADMIN);
    const studentCtx = createMockContext(ROLES.STUDENT);

    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);

    middleware(alumniCtx.req, alumniCtx.res, alumniCtx.next);
    assert.equal(alumniCtx.wasNextCalled(), true);

    middleware(adminCtx.req, adminCtx.res, adminCtx.next);
    assert.equal(adminCtx.wasNextCalled(), true);

    middleware(studentCtx.req, studentCtx.res, studentCtx.next);
    assert.equal(studentCtx.wasNextCalled(), false);
    assert.equal(studentCtx.getStatus(), 403);
  });

  it('should allow ALUMNI and ADMIN roles to update mentorship request status', () => {
    const adminCtx = createMockContext(ROLES.ADMIN);
    const middleware = authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN);
    middleware(adminCtx.req, adminCtx.res, adminCtx.next);
    assert.equal(adminCtx.wasNextCalled(), true);
  });
});
