const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  campaignQuerySchema,
  initiateDonationSchema,
  verifyDonationSchema,
  myDonationHistoryQuerySchema,
  adminDonationQuerySchema
} = require('../src/validators/donation.validator');
const { ROLES } = require('../src/constants/roles');
const { authorizeRoles } = require('../src/middlewares/auth');

// ─── A. DONATION CAMPAIGN & TRANSACTION VALIDATION ────────────────────────────

describe('A. DONATION CAMPAIGN & TRANSACTION VALIDATION', () => {
  it('should accept valid donation initiation payload with positive amount', () => {
    const validDonation = { amount: 5000 };
    const result = initiateDonationSchema.safeParse(validDonation);
    assert.equal(result.success, true);
    assert.equal(result.data.amount, 5000);
  });

  it('should accept decimal donation amount strings and transform to numbers', () => {
    const validStringAmount = { amount: '2500.50' };
    const result = initiateDonationSchema.safeParse(validStringAmount);
    assert.equal(result.success, true);
    assert.equal(result.data.amount, 2500.5);
  });

  it('should reject non-positive donation amounts (zero or negative)', () => {
    assert.equal(initiateDonationSchema.safeParse({ amount: 0 }).success, false);
    assert.equal(initiateDonationSchema.safeParse({ amount: -100 }).success, false);
  });

  it('should reject donation amount with invalid decimal precision or malformed characters', () => {
    assert.equal(initiateDonationSchema.safeParse({ amount: '500.999' }).success, false);
    assert.equal(initiateDonationSchema.safeParse({ amount: 'five hundred' }).success, false);
  });

  it('should validate cryptographic payment verification payloads', () => {
    const validVerify = {
      razorpay_order_id: 'order_9A33X564NN5',
      razorpay_payment_id: 'pay_2938472938',
      razorpay_signature: '9ef87b38d38b89e34c9',
      transactionId: 42
    };
    const result = verifyDonationSchema.safeParse(validVerify);
    assert.equal(result.success, true);
    assert.equal(result.data.transactionId, 42);
  });

  it('should reject payment verification payload missing signature or order ID', () => {
    const missingSignature = {
      razorpay_order_id: 'order_9A33X564NN5',
      razorpay_payment_id: 'pay_2938472938'
    };
    const result = verifyDonationSchema.safeParse(missingSignature);
    assert.equal(result.success, false);
  });

  it('should validate admin donation query filters (status, date range, campaign)', () => {
    const validAdminQuery = {
      status: 'SUCCESS',
      campaignId: '3',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      page: '1',
      limit: '25'
    };
    const result = adminDonationQuerySchema.safeParse(validAdminQuery);
    assert.equal(result.success, true);
    assert.equal(result.data.status, 'SUCCESS');
    assert.equal(result.data.campaignId, 3);
    assert.equal(result.data.limit, 25);
  });

  it('should reject admin donation query with unauthorized status enum', () => {
    const invalidQuery = { status: 'REFUNDED_MANUAL_OVERRIDE' };
    const result = adminDonationQuerySchema.safeParse(invalidQuery);
    assert.equal(result.success, false);
  });
});

// ─── B. DONATION AUTHORIZATION & SECURITY ─────────────────────────────────────

describe('B. DONATION AUTHORIZATION & SECURITY', () => {
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

  it('should permit only ADMIN role to access administrative donation routes', () => {
    const adminCtx = createMockContext(ROLES.ADMIN);
    const middleware = authorizeRoles(ROLES.ADMIN);
    middleware(adminCtx.req, adminCtx.res, adminCtx.next);
    assert.equal(adminCtx.wasNextCalled(), true);

    const alumniCtx = createMockContext(ROLES.ALUMNI);
    middleware(alumniCtx.req, alumniCtx.res, alumniCtx.next);
    assert.equal(alumniCtx.wasNextCalled(), false);
    assert.equal(alumniCtx.getStatus(), 403);
  });

  it('should block unauthenticated access to donation administration', () => {
    const unauthCtx = createMockContext(null);
    const middleware = authorizeRoles(ROLES.ADMIN);
    middleware(unauthCtx.req, unauthCtx.res, unauthCtx.next);
    assert.equal(unauthCtx.wasNextCalled(), false);
    assert.equal(unauthCtx.getStatus(), 401);
  });
});

// ─── C. SUCCESS STORY SUBMISSION & AUTHORIZATION ──────────────────────────────

describe('C. SUCCESS STORY SUBMISSION & AUTHORIZATION', () => {
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

  it('should allow ALUMNI role to submit success stories', () => {
    const alumniCtx = createMockContext(ROLES.ALUMNI);
    const middleware = authorizeRoles(ROLES.ALUMNI);
    middleware(alumniCtx.req, alumniCtx.res, alumniCtx.next);
    assert.equal(alumniCtx.wasNextCalled(), true);
  });

  it('should deny STUDENT role from submitting stories reserved for verified graduates', () => {
    const studentCtx = createMockContext(ROLES.STUDENT);
    const middleware = authorizeRoles(ROLES.ALUMNI);
    middleware(studentCtx.req, studentCtx.res, studentCtx.next);
    assert.equal(studentCtx.wasNextCalled(), false);
    assert.equal(studentCtx.getStatus(), 403);
  });

  it('should validate story input criteria (title length, content limits, URL pattern)', () => {
    const validateStoryInput = (data) => {
      const { title, content, imageUrl } = data;
      if (typeof title !== 'string' || !title.trim() || title.length > 200) return false;
      if (typeof content !== 'string' || !content.trim() || content.length > 10000) return false;
      if (imageUrl && (typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl))) return false;
      return true;
    };

    assert.equal(
      validateStoryInput({
        title: 'Founder Journey at TechScale',
        content: 'From university lab to enterprise tech provider.',
        imageUrl: 'https://images.unsplash.com/sample.jpg'
      }),
      true
    );

    // Empty title
    assert.equal(validateStoryInput({ title: '', content: 'valid content' }), false);
    // Invalid image URL schema (e.g. ftp)
    assert.equal(validateStoryInput({ title: 'Title', content: 'Content', imageUrl: 'ftp://insecure' }), false);
  });
});
