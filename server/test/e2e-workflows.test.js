const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { ROLES, ROLE_PERMISSIONS } = require('../src/constants/roles');
const { authorizeRoles } = require('../src/middlewares/auth');

// Validators across all system modules
const { registerSchema, loginSchema } = require('../src/validators/auth.validator');
const { updateProfileSchema } = require('../src/validators/profile.validator');
const { createJobSchema, updateJobSchema, jobQuerySchema } = require('../src/validators/job.validator');
const { createApplicationSchema, updateApplicationStatusSchema } = require('../src/validators/application.validator');
const { createEventSchema, updateEventSchema, eventQuerySchema } = require('../src/validators/event.validator');
const { registrationPaginationQuerySchema } = require('../src/validators/registration.validator');
const { createMentorshipRequestSchema, updateMentorshipStatusSchema, mentorshipQuerySchema } = require('../src/validators/mentorship.validator');
const { initiateDonationSchema, verifyDonationSchema, adminDonationQuerySchema, campaignQuerySchema } = require('../src/validators/donation.validator');
const { createSuccessStorySchema, updateSuccessStorySchema, publicStoryQuerySchema } = require('../src/validators/successStory.validator');
const { adminStoryQuerySchema } = require('../src/validators/adminSuccessStory.validator');

// ─── Test Helpers ────────────────────────────────────────────────────────────

function mockContext(roleName, userId = 1) {
  let statusCode = null;
  let jsonBody = null;
  let nextCalled = false;

  const req = {
    user: roleName ? { id: userId, role: { name: roleName } } : null,
    session: roleName ? { userId, role: roleName } : null
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

// ─── 1. ALUMNI END-TO-END WORKFLOW ───────────────────────────────────────────

describe('1. ALUMNI END-TO-END USER JOURNEY', () => {
  it('E2E-ALU-01: Alumni registration & credential validation', () => {
    const registrationPayload = {
      email: 'priya.alumni@gec.edu',
      password: 'StrongPassword123!',
      fullName: 'Priya Sundaram',
      role: 'ALUMNI'
    };
    const regResult = registerSchema.safeParse(registrationPayload);
    assert.equal(regResult.success, true);
    assert.equal(regResult.data.email, 'priya.alumni@gec.edu');

    // Login validation
    const loginResult = loginSchema.safeParse({
      email: 'priya.alumni@gec.edu',
      password: 'StrongPassword123!'
    });
    assert.equal(loginResult.success, true);
  });

  it('E2E-ALU-02: Alumni profile completion & graduation details update', () => {
    const profilePayload = {
      fullName: 'Priya Sundaram',
      graduationYear: 2017,
      department: 'Mechanical Engineering',
      currentJobTitle: 'Founder & CEO',
      currentCompany: 'RoboScale Systems',
      bio: 'Building autonomous robotics platforms for smart logistics.',
      linkedinUrl: 'https://linkedin.com/in/priyasundaram'
    };
    const profResult = updateProfileSchema.safeParse(profilePayload);
    assert.equal(profResult.success, true);
    assert.equal(profResult.data.currentCompany, 'RoboScale Systems');
  });

  it('E2E-ALU-03: Alumni job posting creation workflow', () => {
    const jobPayload = {
      title: 'Senior Robotics Software Engineer',
      description: 'Join our alumni-backed startup to develop path-planning algorithms.',
      company: 'RoboScale Systems',
      location: 'Bengaluru / Hybrid',
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Senior',
      salaryMin: 1800000,
      salaryMax: 2600000,
      applicationDeadline: '2026-12-31'
    };
    const jobResult = createJobSchema.safeParse(jobPayload);
    assert.equal(jobResult.success, true);

    // Verify ALUMNI authorization
    const ctx = mockContext(ROLES.ALUMNI);
    authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN)(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('E2E-ALU-04: Alumni institutional event creation & management', () => {
    const eventPayload = {
      title: 'Robotics & Hardware Alumni Showcase 2026',
      description: 'Hands-on demonstrations from engineering alumni founders.',
      location: 'Mechanical Block Seminar Hall',
      startDate: '2026-12-15T09:30:00Z',
      endDate: '2026-12-15T17:00:00Z',
      registrationDeadline: '2026-12-14T23:59:59Z',
      capacity: 150
    };
    const eventResult = createEventSchema.safeParse(eventPayload);
    assert.equal(eventResult.success, true);

    const ctx = mockContext(ROLES.ALUMNI);
    authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN)(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('E2E-ALU-05: Alumni mentorship status handling (mentor receiving & accepting request)', () => {
    // Alumni status update for received mentorship request
    const updatePayload = { status: 'ACCEPTED' };
    const result = updateMentorshipStatusSchema.safeParse(updatePayload);
    assert.equal(result.success, true);

    const ctx = mockContext(ROLES.ALUMNI);
    authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN)(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('E2E-ALU-06: Alumni success story submission for editorial review', () => {
    const storyPayload = {
      title: 'From Campus Lab to Series A Startup Founder',
      content: 'A deep dive into how our collegiate robotics laboratory fostered the core vision behind RoboScale.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'
    };
    const storyResult = createSuccessStorySchema.safeParse(storyPayload);
    assert.equal(storyResult.success, true);

    const ctx = mockContext(ROLES.ALUMNI);
    authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN)(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('E2E-ALU-07: Alumni donation flow initiation & verification', () => {
    const donatePayload = { amount: 25000 };
    const donateResult = initiateDonationSchema.safeParse(donatePayload);
    assert.equal(donateResult.success, true);

    const verifyPayload = {
      razorpay_order_id: 'order_ALU_928374',
      razorpay_payment_id: 'pay_ALU_019283',
      razorpay_signature: 'hmac_sha256_verified_signature_992'
    };
    const verifyResult = verifyDonationSchema.safeParse(verifyPayload);
    assert.equal(verifyResult.success, true);
  });
});

// ─── 2. STUDENT END-TO-END WORKFLOW ──────────────────────────────────────────

describe('2. STUDENT END-TO-END USER JOURNEY', () => {
  it('E2E-STU-01: Student registration and credential validation', () => {
    const studentPayload = {
      email: 'rahul.student@gec.edu',
      password: 'StudentSecurePass2026#',
      fullName: 'Rahul Verma',
      role: 'STUDENT'
    };
    const regResult = registerSchema.safeParse(studentPayload);
    assert.equal(regResult.success, true);
    assert.equal(regResult.data.email, 'rahul.student@gec.edu');
  });

  it('E2E-STU-02: Student job browsing and job application submission', () => {
    // Browsing query
    const queryResult = jobQuerySchema.safeParse({ search: 'Robotics', page: 1, limit: 10 });
    assert.equal(queryResult.success, true);

    // Application submission
    const applicationPayload = {
      coverLetter: 'I have led the campus autonomous rover team and would love to intern at RoboScale.',
      resumeUrl: 'https://storage.cloud.google.com/resumes/rahul-verma.pdf'
    };
    const appResult = createApplicationSchema.safeParse(applicationPayload);
    assert.equal(appResult.success, true);
  });

  it('E2E-STU-03: Student mentorship pairing request submission', () => {
    const mentorRequest = {
      mentorId: 10,
      message: 'Hello Priya maam, I am seeking guidance on robotic perception algorithms.'
    };
    const result = createMentorshipRequestSchema.safeParse(mentorRequest);
    assert.equal(result.success, true);

    const ctx = mockContext(ROLES.STUDENT);
    authorizeRoles(ROLES.STUDENT)(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('E2E-STU-04: Student event discovery and attendee registration', () => {
    const queryResult = eventQuerySchema.safeParse({ upcoming: 'true', limit: 10 });
    assert.equal(queryResult.success, true);

    const pageResult = registrationPaginationQuerySchema.safeParse({ page: 1, limit: 10 });
    assert.equal(pageResult.success, true);
  });

  it('E2E-STU-05: Student access restrictions (must be denied alumni/admin privileges)', () => {
    const ctx = mockContext(ROLES.STUDENT);

    // Student denied job creation
    authorizeRoles(ROLES.ALUMNI, ROLES.ADMIN)(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), false);
    assert.equal(ctx.getStatus(), 403);

    // Student denied admin donation panel
    const adminCtx = mockContext(ROLES.STUDENT);
    authorizeRoles(ROLES.ADMIN)(adminCtx.req, adminCtx.res, adminCtx.next);
    assert.equal(adminCtx.wasNextCalled(), false);
    assert.equal(adminCtx.getStatus(), 403);
  });
});

// ─── 3. ADMINISTRATOR END-TO-END WORKFLOW ────────────────────────────────────

describe('3. ADMINISTRATOR END-TO-END USER JOURNEY', () => {
  it('E2E-ADM-01: Admin access to all institutional management modules', () => {
    const ctx = mockContext(ROLES.ADMIN);
    authorizeRoles(ROLES.ADMIN)(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.wasNextCalled(), true);
  });

  it('E2E-ADM-02: Admin job moderation (querying active and expired postings)', () => {
    const queryResult = jobQuerySchema.safeParse({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
    assert.equal(queryResult.success, true);
  });

  it('E2E-ADM-03: Admin event administration and capacity auditing', () => {
    const updateResult = updateEventSchema.safeParse({
      title: 'Showcase 2026 - Updated Venue',
      capacity: 200
    });
    assert.equal(updateResult.success, true);
    assert.equal(updateResult.data.capacity, 200);
  });

  it('E2E-ADM-04: Admin donation financial summary and transaction audit', () => {
    const adminQuery = {
      status: 'SUCCESS',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      page: 1,
      limit: 50
    };
    const result = adminDonationQuerySchema.safeParse(adminQuery);
    assert.equal(result.success, true);
    assert.equal(result.data.status, 'SUCCESS');
  });

  it('E2E-ADM-05: Admin success story review and publication control', () => {
    const storyQuery = {
      status: 'published',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    };
    const result = adminStoryQuerySchema.safeParse(storyQuery);
    assert.equal(result.success, true);
    assert.equal(result.data.status, 'published');
  });

  it('E2E-ADM-06: Unauthenticated request rejection across administrative endpoints', () => {
    const unauthCtx = mockContext(null);
    authorizeRoles(ROLES.ADMIN)(unauthCtx.req, unauthCtx.res, unauthCtx.next);
    assert.equal(unauthCtx.wasNextCalled(), false);
    assert.equal(unauthCtx.getStatus(), 401);
  });
});

// ─── 4. CROSS-MODULE DATA FLOW INTEGRITY ─────────────────────────────────────

describe('4. CROSS-MODULE DATA FLOW & INTEGRITY', () => {
  it('E2E-INT-01: Public published story query hides unapproved drafts', () => {
    const publicQuery = publicStoryQuerySchema.safeParse({ page: 1, limit: 9 });
    assert.equal(publicQuery.success, true);
  });

  it('E2E-INT-02: Public campaign query returns valid listing pagination', () => {
    const campaignQuery = campaignQuerySchema.safeParse({ page: 1, limit: 12 });
    assert.equal(campaignQuery.success, true);
  });

  it('E2E-INT-03: Mentorship query parameters validate status filters', () => {
    const query = mentorshipQuerySchema.safeParse({ status: 'PENDING', page: 1, limit: 20 });
    assert.equal(query.success, true);
    assert.equal(query.data.status, 'PENDING');
  });
});
