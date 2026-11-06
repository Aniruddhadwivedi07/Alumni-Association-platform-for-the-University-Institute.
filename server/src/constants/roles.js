/**
 * Role and Permission Constants for RBAC
 * Keep role values aligned with the database seed values: 'STUDENT', 'ALUMNI', 'ADMIN'
 */

const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  ALUMNI: 'ALUMNI',
  ADMIN: 'ADMIN'
});

/**
 * Role hierarchy / permission mapping:
 * - STUDENT: Student-accessible routes
 * - ALUMNI: Student-accessible routes + alumni-specific routes
 * - ADMIN: Administrative routes + all other protected routes
 */
const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.STUDENT]: Object.freeze([ROLES.STUDENT]),
  [ROLES.ALUMNI]: Object.freeze([ROLES.STUDENT, ROLES.ALUMNI]),
  [ROLES.ADMIN]: Object.freeze([ROLES.STUDENT, ROLES.ALUMNI, ROLES.ADMIN])
});

module.exports = {
  ROLES,
  ROLE_PERMISSIONS
};

