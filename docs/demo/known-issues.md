# Known Limitations & Architecture Dependencies

**Document Purpose:** Transparently document technical boundaries, external dependencies, and future enhancement roadmap items.

---

## 1. Documented Architecture Boundaries

### A. Direct Manual Payment Status Overrides
- **Limitation**: Administrators cannot manually change a donation transaction's status to `SUCCESS` from the frontend interface.
- **Rationale**: Financial audit compliance requires payment confirmations to originate exclusively through cryptographic payment provider callbacks (`Razorpay HMAC-SHA256`) or verified webhooks.
- **Handling**: `AdminDonations.jsx` is strictly an audit and transaction oversight console.

### B. Relational Survey Database Models
- **Limitation**: Survey questionnaires and feedback responses currently use lightweight in-memory and endpoint-based models rather than dedicated Prisma tables (`Survey`, `SurveyQuestion`, `SurveyResponse`).
- **Rationale**: Upstream database schema owned by Aniruddha focuses primarily on Core Users, Jobs, Events, Mentorship, Donations, and Success Stories.
- **Handling**: Handled gracefully via `AdminSurveys.jsx` and `Feedback.jsx` with full client validation, ticket resolution workflows, and seed data.

### C. PDF Receipt Rendering Engine
- **Limitation**: PDF receipt generation requires `pdfkit` dependency installed in the server environment.
- **Handling**: Backend gracefully handles receipt requests; if `pdfkit` is absent in minimal container runtimes, clear HTTP error reporting is returned without crashing the server.

### D. Single-Active Mentorship Pairing Constraints
- **Limitation**: Database schema allows multiple pairing requests between the same student and mentor over time.
- **Handling**: Business logic resolves active requests via status enum `ACCEPTED`, while historical requests remain recorded as `COMPLETED`.
