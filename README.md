<div align="center">

🎓 Alumni Association Platform

Bridging Students, Alumni & Opportunities.

A unified digital ecosystem that connects students, alumni, and administrators through professional networking, career opportunities, mentorship, events, and community engagement.

<br />
<a href="https://alumni-association-platform-for-the.vercel.app/">
  <img src="https://img.shields.io/badge/🌐_LIVE_DEMO-Visit_Platform-2563EB?style=for-the-badge" alt="Live Demo" />
</a>
</div>

⸻

✨ Overview

The Alumni Association Platform is a full-stack web application designed to strengthen the relationship between an educational institution, its students, and its alumni network.

It provides a centralized space where students can discover career opportunities, connect with experienced alumni, participate in events, and seek mentorship. Alumni can contribute to the community by sharing professional opportunities, mentoring students, and publishing their success stories.

Administrators get dedicated tools to oversee platform activities, manage content, and monitor community engagement.

The goal is simple:

Transform an institution’s alumni network into an active, accessible, and collaborative ecosystem.

🚀 Key Features

👥 Alumni Directory & Networking

* Searchable alumni directory.
* Discover alumni by graduation year, department, company, and professional role.
* View alumni profiles and professional information.
* Connect students with experienced graduates.

💼 Career & Job Portal

* Alumni can publish job opportunities.
* Students and alumni can explore available openings.
* Submit applications through the platform.
* Track application history and status.
* Job creators can manage their postings and applications.

🎯 Mentorship System

* Students can discover potential alumni mentors.
* Submit mentorship requests.
* Alumni can accept or reject incoming requests.
* Track mentorship request status.

📅 Events & Registrations

* Discover upcoming alumni and institutional events.
* View event details and registration deadlines.
* Register for events.
* Track personal event registrations.
* Manage event listings through authorized accounts.

💝 Donations & Fundraising

* Explore donation campaigns.
* Contribute to institutional campaigns.
* Integrated Razorpay payment workflow.
* Payment verification and transaction tracking.
* Donation history and downloadable receipts.

🏆 Alumni Success Stories

* Alumni can share professional journeys and achievements.
* Publish and manage personal stories.
* Browse published stories.
* Administrative moderation and content management.

🛡️ Role-Based Administration

Dedicated access and functionality for three user roles:

Role	Capabilities
STUDENT	Explore alumni, discover jobs, apply, register for events, request mentorship
ALUMNI	Manage professional opportunities, mentor students, participate in events, publish success stories
ADMIN	Administrative dashboards, content moderation, event/job/donation management

🔐 Authentication & Security

* User registration and login.
* Secure password hashing.
* Server-side session authentication.
* PostgreSQL-backed session storage.
* Role-based access control.
* Protected API endpoints.
* Input validation using Zod.

⸻

🏗️ Technology Stack

The platform follows a JavaScript-based full-stack architecture.

Layer	Technologies
Frontend	React 19, Vite
Styling	Tailwind CSS
Routing	React Router
Backend	Node.js, Express.js
Database	PostgreSQL
ORM	Prisma
Authentication	Express Session, bcrypt
Session Storage	connect-pg-simple
Validation	Zod
Payments	Razorpay
PDF Generation	PDFKit
Testing	Node.js Test Runner

⸻

🧩 System Architecture

                  ┌─────────────────────────┐
                  │         USERS           │
                  │                         │
                  │  Students / Alumni      │
                  │       Admins            │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │      REACT FRONTEND     │
                  │                         │
                  │  React + Vite           │
                  │  Tailwind CSS           │
                  │  React Router           │
                  └────────────┬────────────┘
                               │
                         REST API / HTTPS
                               │
                               ▼
                  ┌─────────────────────────┐
                  │      EXPRESS SERVER     │
                  │                         │
                  │  Authentication         │
                  │  Authorization          │
                  │  Business Logic         │
                  │  Input Validation       │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │       PRISMA ORM        │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │      POSTGRESQL         │
                  │                         │
                  │  Users & Profiles       │
                  │  Jobs & Applications    │
                  │  Events & Registrations │
                  │  Mentorship             │
                  │  Donations              │
                  │  Success Stories        │
                  └─────────────────────────┘
                       External Services
                               │
                               ▼
                         RAZORPAY

⸻

📁 Project Structure

Alumni-Association-platform-for-the-University-Institute/
│
├── client/                         # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── admin/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   │
│   │   ├── context/                 # Global application state
│   │   ├── lib/                     # API and utility functions
│   │   ├── pages/                   # Application pages
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── directory/
│   │   │   ├── donations/
│   │   │   ├── events/
│   │   │   ├── jobs/
│   │   │   ├── mentorship/
│   │   │   ├── profile/
│   │   │   └── stories/
│   │   │
│   │   ├── test/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   └── package.json
│
├── server/                          # Express backend
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── prisma.js
│   │   └── server.js
│   │
│   ├── test/
│   ├── .env.example
│   └── package.json
│
├── docs/                            # Project documentation
├── .gitignore
└── README.md

Note: The structure above represents the major project directories; individual files may vary as development progresses.

⸻

⚙️ Getting Started

Follow these instructions to run the project locally.

Prerequisites

Make sure you have installed:

* Node.js (v20+ recommended)
* npm
* PostgreSQL
* Git

1. Clone the repository

git clone https://github.com/Aniruddhadwivedi07/Alumni-Association-platform-for-the-University-Institute..git
cd Alumni-Association-platform-for-the-University-Institute.

2. Configure the backend

cd server
npm install

Create a .env file inside the server/ directory.

Configure the required environment variables:

PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/alumni_association?schema=public"
SESSION_SECRET="your-long-random-secret"

Configure any additional environment variables required by the existing application, including Razorpay credentials if using payment functionality.

3. Set up the database

Generate the Prisma client:

npx prisma generate

Apply existing migrations:

npx prisma migrate deploy

For a fresh local development database, use the appropriate development migration workflow instead.

4. Start the backend

npm run dev

The backend should be available at:

http://localhost:5000

5. Configure the frontend

Open another terminal:

cd client
npm install

Create client/.env:

VITE_API_BASE_URL=http://localhost:5000/api

6. Start the frontend

npm run dev

Open the local Vite URL shown in your terminal, usually:

http://localhost:5173

⸻

🧪 Testing

The project includes automated backend and frontend workflow tests.

Backend tests

cd server
npm test

Frontend tests

cd client
npm test

Frontend production build

cd client
npm run build

Frontend linting

cd client
npm run lint

⸻

🔒 Security Considerations

Security is integrated into the application’s backend architecture.

* Passwords are hashed before database storage.
* Authentication uses server-side sessions.
* Session data is stored in PostgreSQL.
* Role-based authorization is enforced on protected backend routes.
* Zod validates incoming request data.
* Sensitive credentials are stored in environment variables.
* Payment status is verified through trusted payment-provider mechanisms.

Never commit .env files, database credentials, session secrets, or payment-provider secrets to version control.

⸻

🌐 Deployment

The frontend is deployed and accessible here:

<div align="center">

🚀 Visit the Live Alumni Association Platform

</div>

⸻

🎯 Project Objectives

This project aims to:

1. Establish a centralized digital alumni network.
2. Improve student-alumni interaction.
3. Simplify access to professional opportunities.
4. Encourage mentorship and knowledge sharing.
5. Promote institutional events and community participation.
6. Enable transparent digital fundraising.
7. Preserve and showcase alumni achievements.

⸻

🔮 Future Enhancements

Potential improvements include:

* Real-time messaging between students and alumni.
* Advanced mentor discovery and recommendation.
* Email and push notifications.
* Resume upload and document management.
* Alumni verification workflows.
* Analytics and engagement dashboards.
* Advanced search and recommendation systems.
* Custom institutional branding and domain support.

⸻

👨‍💻 Contributors

Developed as a collaborative academic project by a team of three contributors.

Contributions, suggestions, and improvements are welcome.

⸻

<div align="center">

Built to Connect. Designed to Empower.

Strengthening the bond between institutions, students, and alumni.

<br />

⭐ If you find this project interesting, consider giving the repository a star!

</div>