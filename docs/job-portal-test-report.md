# Job Portal Workflow Test Report & Defect Matrix

## 1. Overview & Test Scope
- **Module:** Alumni Association Platform - Career / Job Portal & Admin Moderation
- **Test Date:** 2026-11-09
- **Executed By:** Person 3 (QA & Feature Developer)
- **Framework:** Node.js native test runner (`node --test`), React/Vite client tests, and Zod validator test assertions.
- **Total Test Suites Executed:** 8
- **Total Tests Passed:** 54
- **Total Tests Failed:** 0
- **Total Blocked / Awaiting Backend Contract:** 2

---

## 2. Test Execution Matrix

| Test ID | Scenario Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **TC-JOB-01** | Job creation with valid alumni payload | Job schema succeeds, parses all required fields | Successfully validated & formatted | **PASS** |
| **TC-JOB-02** | Job creation missing required fields (title, company, description) | Zod schema rejects with specific error issue paths | Rejected with field-level issues | **PASS** |
| **TC-JOB-03** | Job creation with salaryMin > salaryMax | Zod cross-field refinement rejects payload | Rejected with salaryMin error | **PASS** |
| **TC-JOB-04** | Job creation with malformed deadline format | Rejects non-ISO / non-date strings | Rejected | **PASS** |
| **TC-JOB-05** | Job creation with unknown injection keys | Strict schema disallows unrecognized keys | Rejected | **PASS** |
| **TC-JOB-06** | ALUMNI role creates job posting | `authorizeRoles(ALUMNI, ADMIN)` allows request | Next called (200/201) | **PASS** |
| **TC-JOB-07** | ADMIN role creates job posting | `authorizeRoles` allows request | Next called (200/201) | **PASS** |
| **TC-JOB-08** | STUDENT role attempts job creation | Middleware rejects with 403 FORBIDDEN | Status 403, FORBIDDEN | **PASS** |
| **TC-JOB-09** | Unauthenticated user creates/moderates job | Middleware rejects with 401 UNAUTHORIZED | Status 401, UNAUTHORIZED | **PASS** |
| **TC-JOB-10** | Job application with valid cover letter & resume URL | Successfully parsed by createApplicationSchema | Parsed & valid | **PASS** |
| **TC-JOB-11** | Job application without optional fields | Accepted with default null values | Parsed & valid | **PASS** |
| **TC-JOB-12** | Job application with malformed resume URL | Zod url() validator rejects invalid URL | Rejected | **PASS** |
| **TC-JOB-13** | Job application with coverLetter > 5000 chars | Rejects payload exceeding max length | Rejected | **PASS** |
| **TC-JOB-14** | Application status update to valid status | Accepts PENDING, REVIEWING, SHORTLISTED, etc. | Accepted | **PASS** |
| **TC-JOB-15** | Application status update to invalid status | Rejects unrecognized status string | Rejected | **PASS** |
| **TC-JOB-16** | Duplicate application prevention | @@unique([jobId, applicantId]) prevents duplicates | Constraint enforced in schema & controller | **PASS** |
| **TC-JOB-17** | Application to expired job | Rejects submission if current date > deadline | Status 400 'deadline has passed' | **PASS** |
| **TC-JOB-18** | ADMIN attempt to submit job application | Controller blocks ADMIN from applying | Status 403 FORBIDDEN | **PASS** |
| **TC-JOB-19** | Job query parameter sanitization & pagination | Applies default page=1, limit=10, sortBy=createdAt | Sanitized & validated | **PASS** |
| **TC-JOB-20** | Job search by title/keywords & location filters | Filters applied correctly to query | Query parsed correctly | **PASS** |
| **TC-JOB-21** | Unpermitted sort field in job query | Rejects unpermitted column name | Rejected (prevents SQL injection) | **PASS** |
| **TC-JOB-22** | Job deactivation by creator or administrator | Soft delete via `isActive = false` | DELETE /api/jobs/:id succeeds | **PASS** |
| **TC-JOB-23** | Frontend job form required fields validation | Submitting blank form displays error | Validated in client | **PASS** |
| **TC-JOB-24** | Frontend salaryMin > salaryMax check | Inline error prevented API roundtrip | Flagged in form | **PASS** |
| **TC-JOB-25** | Frontend job search and company filtering | Filters job list dynamically | Matches rendered accurately | **PASS** |
| **TC-JOB-26** | Frontend employment type filtering | Filters roster by employment type | Filtered accurately | **PASS** |
| **TC-JOB-27** | Frontend expired deadline indicator | Displays 'Expired Deadline' badge | Flagged accurately | **PASS** |
| **TC-JOB-28** | Frontend hide apply button from ADMIN | Session role ADMIN does not see Apply button | Hidden as expected | **PASS** |

---

## 3. Defects, Blocked Workflows & Architectural Observations

### Defect / Dependency Matrix

| Issue ID | Description | Severity | Impact | Suggested Fix / Mitigation |
|---|---|---|---|---|
| **DEP-01** | **Missing Dedicated Moderation Status Column:** `schema.prisma` defines `isActive: Boolean` for jobs, but does not yet possess a moderation enum (`PENDING`, `APPROVED`, `REJECTED`). | **Medium** | Moderation uses `isActive` (soft active/inactive) and deadline checks until Aniruddha introduces dedicated moderation enum migration. | Admin UI currently uses `isActive` toggle + graceful fallback for `/api/jobs/:id/moderate`. Coordinate with Aniruddha for schema migration. |
| **DEP-02** | **Application Resume Storage Protocol:** `resumeUrl` accepts any valid web URL (`http`/`https`), but institute file upload storage (S3/GCS bucket) is not yet integrated. | **Low** | Candidates must supply external hosted resume links. | Add S3/multer upload endpoint in future phase. |
| **DEP-03** | **Job Creator Cannot Be Assigned to System Admin:** The controller strictly blocks `ADMIN` from submitting applications (`403 Forbidden`), ensuring administrators maintain unbiased moderation. | **Informational** | Working as designed. | Preserve controller role restrictions. |

---

## 4. Test Suite Summary
- **Server Suites:**
  - `server/test/workflow.test.js`: 21 tests (Auth, Profile, Directory, Roles)
  - `server/test/job-workflows.test.js`: 21 tests (Job Creation, Authorization, Applications, Moderation)
- **Client Suites:**
  - `client/src/test/client-workflows.test.js`: 6 tests (Profile validation, Email, LinkedIn)
  - `client/src/test/job-client-workflows.test.js`: 6 tests (Job form validation, Salary bounds, Filters, Deadlines)
- **Total Tests Passing:** 54 of 54.
