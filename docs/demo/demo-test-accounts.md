# Demonstration Test Accounts Matrix

**Document Purpose:** Provide pre-configured, safe testing credentials for all three supported user personas without hardcoding sensitive production secrets.

---

## 1. Account Roles & Capability Matrix

| Persona | Role Identifier | Access Level | Primary Capabilities |
|---|---|---|---|
| **Alumni Member** | `ALUMNI` | Authenticated Alumni | Edit profile, post jobs, create events, receive/accept mentorship requests, donate, submit success stories, provide feedback. |
| **Current Student** | `STUDENT` | Authenticated Student | Browse directory, browse jobs, apply for jobs, register for events, request mentors, submit feedback. |
| **Institutional Admin** | `ADMIN` | System Administrator | Access `/admin/*` portal, verify alumni, moderate jobs, manage events, audit donations, manage surveys, publish success stories. |

---

## 2. Seeded Demonstration Credentials

If `prisma db seed` was executed during database setup, the following standard accounts are available:

### A. Administrator Account
- **Email**: `admin@gec.edu`
- **Password**: `AdminSecure2026!`
- **Role**: `ADMIN`
- **Permissions**: Full unrestricted administrative console access.

### B. Alumni Member Account
- **Email**: `priya.sundaram@alumni.gec.edu`
- **Password**: `AlumniPass2026!`
- **Role**: `ALUMNI`
- **Profile**: Priya Sundaram (Class of 2017, Mechanical Engineering, Founder at RoboScale Systems).

### C. Student Account
- **Email**: `rahul.verma@student.gec.edu`
- **Password**: `StudentPass2026!`
- **Role**: `STUDENT`
- **Profile**: Rahul Verma (Class of 2026, Computer Science & Engineering).

---

## 3. Manual Account Provisioning Procedure

If testing on a fresh, unseeded database:

1. Navigate to `http://localhost:5173/register`.
2. Fill out the registration form:
   - Provide email, full name, and password (minimum 8 characters).
   - Select either `STUDENT` or `ALUMNI` as the intended role.
3. Submit the registration form.
4. For `ADMIN` accounts:
   - Connect to PostgreSQL (`psql -d alumni_db`).
   - Run:
     ```sql
     UPDATE "User"
     SET "roleId" = (SELECT id FROM "Role" WHERE name = 'ADMIN')
     WHERE email = 'your_registered_admin_email@gec.edu';
     ```
5. Log in at `http://localhost:5173/login`.
