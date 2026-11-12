# Demonstration Visual Verification & Screenshot Guide

**Document Purpose:** Catalog required photographic evidence and screenshots validating each key view across desktop and mobile layouts.

---

## 1. Visual Verification Checklist

| Screenshot Identifier | Page / Feature | Viewport | Required Visual Elements |
|---|---|---|---|
| `01-homepage.png` | Landing Page (`/`) | Desktop (1440px) | Hero section, primary navigation with Feedback link, call-to-action buttons. |
| `02-login-page.png` | Sign In (`/login`) | Desktop (1440px) | Clean credential form, role selection, validation feedback. |
| `03-alumni-directory.png` | Directory (`/directory`) | Desktop (1440px) | Search bar, department filters, verified member cards with LinkedIn badges. |
| `04-job-portal.png` | Job Board (`/jobs`) | Desktop (1440px) | Filter chips, job cards with salary ranges, company names, and apply buttons. |
| `05-event-administration.png` | Admin Events (`/admin/events`) | Desktop (1440px) | KPI stats cards, events table, "+ Create Event" action button. |
| `06-mentorship-management.png` | Admin Mentorship (`/admin/mentorship`) | Desktop (1440px) | Pairing requests table, status badges (`Pending`, `Accepted`), action dialogs. |
| `07-donation-administration.png` | Admin Donations (`/admin/donations`) | Desktop (1440px) | Total raised counter, verified Razorpay payment logs, receipt links. |
| `08-feedback-portal.png` | Public Feedback (`/feedback`) | Mobile (375px) | Responsive star ratings, character counter, clean form layout. |
| `09-surveys-admin.png` | Admin Surveys (`/admin/surveys`) | Desktop (1440px) | Active questionnaires, response counts, feedback resolution queue. |
| `10-story-moderation.png` | Admin Stories (`/admin/success-stories`) | Desktop (1440px) | Story review modal, author credentials, Approve/Reject confirmation dialogs. |
| `11-admin-dashboard.png` | Admin Overview (`/admin`) | Desktop (1440px) | Full admin shell layout, 10-module sidebar, live stat counters. |

---

## 2. Capturing Instructions

To capture screenshots during a local demo session:
1. Ensure both `client` and `server` dev servers are active (`npm run dev`).
2. Open Google Chrome or Chromium in headless or DevTools device mode.
3. Save screenshots as PNG into `docs/demo/screenshots/<identifier>` matching the table above.
