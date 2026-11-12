# Demonstration Setup & Environment Configuration

**Document Purpose:** Guide evaluators and stakeholders through deploying, configuring, and verifying the Alumni Association Platform locally.

---

## 1. Prerequisites

Ensure your system meets the following software requirements:
- **Node.js**: `v20.x` or `v22.x` LTS
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v14` or higher (local or managed instance such as Supabase / Neon)
- **Git**: `v2.30+`

---

## 2. Repository Setup

```bash
# Clone the repository
git clone https://github.com/arjavj1105/Alumni-Association-platform-for-the-University-Institute.git
cd Alumni-Association-platform-for-the-University-Institute.

# Verify working branch
git checkout feature/person-3
```

---

## 3. Environment Variables Configuration

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/alumni_db?schema=public"
SESSION_SECRET="demo-insecure-session-secret-change-in-production-123456"

# Payment Gateway (Test Sandbox)
RAZORPAY_KEY_ID="rzp_test_samplekey123"
RAZORPAY_KEY_SECRET="rzp_test_samplesecret456"
RAZORPAY_WEBHOOK_SECRET="rzp_webhook_secret_789"
CLIENT_URL="http://localhost:5173"
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Database Initialization & Prisma Setup

```bash
cd server
npm install

# Generate Prisma client and apply database migrations
npm run prisma:generate
npx prisma migrate dev --name init

# (Optional) Seed institutional demo records
npm run db:seed
```

---

## 5. Launching the Application

### A. Start the Backend API Server
```bash
cd server
npm run dev
# Server boots at http://localhost:5000
```

### B. Start the Frontend Vite Application
```bash
cd ../client
npm install
npm run dev
# Frontend launches at http://localhost:5173
```

---

## 6. Verification & Automated Test Suite

Run the full automated test suite (146 tests) to verify system health:

```bash
# Backend Test Suite (103 tests)
cd server
npm test

# Frontend Test Suite (42 tests)
cd ../client
npm test

# Production Build Check
cd ../client
npm run build
```
All commands should exit with code `0`.
