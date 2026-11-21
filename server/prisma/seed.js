'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../src/prisma');
const { ROLES } = require('../src/constants/roles');
const {
  generateVerificationCode,
  formatVerificationIdentifier
} = require('../src/utils/numberTheory');

/**
 * Hash a public token using SHA-256
 * @param {string} token
 * @returns {string} hex digest
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function main() {
  console.log('=== Starting Idempotent Demonstration Dataset Seeding ===');

  // ---------------------------------------------------------------------------
  // 1. Roles
  // ---------------------------------------------------------------------------
  const roles = {};
  for (const name of Object.values(ROLES)) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('✓ Roles confirmed:', Object.keys(roles).join(', '));

  // Consistent demo password hash: Password123!
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ---------------------------------------------------------------------------
  // 2. Administrator
  // ---------------------------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@alumni.org' },
    update: {
      roleId: roles[ROLES.ADMIN].id,
      isActive: true
    },
    create: {
      email: 'admin@alumni.org',
      passwordHash,
      roleId: roles[ROLES.ADMIN].id,
      isActive: true,
      alumniProfile: {
        create: {
          fullName: 'Prof. Arvind Raghavan',
          graduationYear: 2005,
          department: 'Computer Science & Engineering',
          currentJobTitle: 'Dean of Alumni & International Affairs',
          currentCompany: 'Institute of Engineering & Technology',
          bio: 'Faculty lead and administrator coordinating global alumni chapters, mentorship programs, and endowment campaigns.',
          linkedinUrl: 'https://linkedin.com/in/arvind-raghavan-admin'
        }
      }
    },
    include: { alumniProfile: true }
  });
  console.log('✓ Administrator confirmed:', adminUser.email);

  // ---------------------------------------------------------------------------
  // 3. Students (At least 3)
  // ---------------------------------------------------------------------------
  const studentData = [
    {
      email: 'aarav.sharma@student.org',
      fullName: 'Aarav Sharma',
      department: 'Computer Science & Engineering',
      graduationYear: 2027,
      bio: 'Third-year undergraduate interested in distributed systems, Rust, and scalable backend architectures.',
      currentJobTitle: 'Undergraduate Research Assistant',
      currentCompany: 'Campus AI Systems Lab',
      linkedinUrl: 'https://linkedin.com/in/aarav-sharma-stu'
    },
    {
      email: 'diya.patel@student.org',
      fullName: 'Diya Patel',
      department: 'Electrical Engineering',
      graduationYear: 2026,
      bio: 'Final-year student specializing in embedded systems, IoT sensors, and renewable power controllers.',
      currentJobTitle: 'Hardware Engineering Intern',
      currentCompany: 'GreenSpark Energy',
      linkedinUrl: 'https://linkedin.com/in/diya-patel-stu'
    },
    {
      email: 'rohan.mehta@student.org',
      fullName: 'Rohan Mehta',
      department: 'Mechanical Engineering',
      graduationYear: 2028,
      bio: 'Second-year mechanical engineering student passionate about autonomous robotics and additive manufacturing.',
      currentJobTitle: 'Student Team Captain',
      currentCompany: 'Formula Student Racing Club',
      linkedinUrl: 'https://linkedin.com/in/rohan-mehta-stu'
    },
    {
      email: 'ishita.verma@student.org',
      fullName: 'Ishita Verma',
      department: 'Information Technology',
      graduationYear: 2026,
      bio: 'Aspiring product engineer and mobile developer. Active mentor in the campus women-in-tech initiative.',
      currentJobTitle: 'Frontend Development Fellow',
      currentCompany: 'OpenEd Foundation',
      linkedinUrl: 'https://linkedin.com/in/ishita-verma-stu'
    }
  ];

  const students = [];
  for (const stu of studentData) {
    const user = await prisma.user.upsert({
      where: { email: stu.email },
      update: {
        roleId: roles[ROLES.STUDENT].id,
        isActive: true
      },
      create: {
        email: stu.email,
        passwordHash,
        roleId: roles[ROLES.STUDENT].id,
        isActive: true,
        alumniProfile: {
          create: {
            fullName: stu.fullName,
            graduationYear: stu.graduationYear,
            department: stu.department,
            currentJobTitle: stu.currentJobTitle,
            currentCompany: stu.currentCompany,
            bio: stu.bio,
            linkedinUrl: stu.linkedinUrl
          }
        }
      },
      include: { alumniProfile: true }
    });
    students.push(user);
  }
  console.log(`✓ Seeded ${students.length} student accounts.`);

  // ---------------------------------------------------------------------------
  // 4. Alumni (At least 10 across diverse departments & graduation years)
  // ---------------------------------------------------------------------------
  const alumniSeedData = [
    {
      email: 'priya.sundaram@alumni.org',
      fullName: 'Priya Sundaram',
      graduationYear: 2017,
      department: 'Mechanical Engineering',
      currentJobTitle: 'VP of Robotics Engineering',
      currentCompany: 'RoboScale Systems',
      bio: 'Co-founder of an autonomous warehouse robotics platform. Passionate about mechatronics and mentoring engineering students.',
      linkedinUrl: 'https://linkedin.com/in/priyasundaram',
      verified: true,
      seq: 1
    },
    {
      email: 'vikram.sen@alumni.org',
      fullName: 'Dr. Vikramaditya Sen',
      graduationYear: 2014,
      department: 'Electronics & Communication',
      currentJobTitle: 'Quantum Research Scientist',
      currentCompany: 'CERN International Lab',
      bio: 'Postdoctoral researcher working on superconducting quantum circuits and cryogenic measurement instruments.',
      linkedinUrl: 'https://linkedin.com/in/vikramsen',
      verified: true,
      seq: 2
    },
    {
      email: 'neha.deshmukh@alumni.org',
      fullName: 'Neha Deshmukh',
      graduationYear: 2020,
      department: 'Computer Science & Engineering',
      currentJobTitle: 'Staff Distributed Systems Engineer',
      currentCompany: 'Microsoft Azure',
      bio: 'Distributed storage architect and open-source contributor. Active speaker on cloud-native fault tolerance.',
      linkedinUrl: 'https://linkedin.com/in/nehadeshmukh',
      verified: true,
      seq: 3
    },
    {
      email: 'karan.patel@alumni.org',
      fullName: 'Karan Patel',
      graduationYear: 2016,
      department: 'Electrical Engineering',
      currentJobTitle: 'Director of Clean Grid Infrastructure',
      currentCompany: 'SunPower Grids',
      bio: 'Deploying hybrid solar microgrids across emerging rural regions. Committed to sustainable energy transition.',
      linkedinUrl: 'https://linkedin.com/in/karanpatel',
      verified: true,
      seq: 4
    },
    {
      email: 'ananya.roy@alumni.org',
      fullName: 'Ananya Roy',
      graduationYear: 2021,
      department: 'Artificial Intelligence & Data Science',
      currentJobTitle: 'Senior Machine Learning Scientist',
      currentCompany: 'Google DeepMind',
      bio: 'Researching multi-modal reasoning models and reinforcement learning from human feedback. Eager to mentor student researchers.',
      linkedinUrl: 'https://linkedin.com/in/ananyaroy',
      verified: true,
      seq: 5
    },
    {
      email: 'rajesh.sharma@alumni.org',
      fullName: 'Rajesh Sharma',
      graduationYear: 2015,
      department: 'Information Technology',
      currentJobTitle: 'Founder & CEO',
      currentCompany: 'FinStack Technologies',
      bio: 'Serial fintech entrepreneur building real-time settlement APIs. Passionate about startup incubation and seed investment.',
      linkedinUrl: 'https://linkedin.com/in/rajeshsharma',
      verified: true,
      seq: 6
    },
    {
      email: 'meera.nair@alumni.org',
      fullName: 'Meera Nair',
      graduationYear: 2019,
      department: 'Civil Engineering',
      currentJobTitle: 'Lead Urban Hydrologist & Planner',
      currentCompany: 'Arup Sustainable Cities',
      bio: 'Designing nature-based stormwater management and climate-resilient coastal infrastructure.',
      linkedinUrl: 'https://linkedin.com/in/meeranair',
      verified: true,
      seq: 7
    },
    {
      email: 'siddharth.joshi@alumni.org',
      fullName: 'Siddharth Joshi',
      graduationYear: 2018,
      department: 'Chemical Engineering',
      currentJobTitle: 'Principal Process Safety Engineer',
      currentCompany: 'Reliance Petrochemicals',
      bio: 'Specializing in refinery optimization, safety integrity systems, and bio-polymer synthesis.',
      linkedinUrl: 'https://linkedin.com/in/siddharthjoshi',
      verified: false
    },
    {
      email: 'tanvi.kulkarni@alumni.org',
      fullName: 'Tanvi Kulkarni',
      graduationYear: 2022,
      department: 'Computer Science & Engineering',
      currentJobTitle: 'Product Manager - Core Payments',
      currentCompany: 'Stripe India',
      bio: 'Former software engineer turned product manager, focusing on global checkout optimization and dispute resolution.',
      linkedinUrl: 'https://linkedin.com/in/tanvikulkarni',
      verified: true,
      seq: 8
    },
    {
      email: 'arjun.menon@alumni.org',
      fullName: 'Arjun Menon',
      graduationYear: 2013,
      department: 'Aerospace Engineering',
      currentJobTitle: 'Head of Satellite Propulsion',
      currentCompany: 'Skyroot Aerospace',
      bio: 'Working on cryogenic upper stages and commercial small-satellite launch vehicle architectures.',
      linkedinUrl: 'https://linkedin.com/in/arjunmenon',
      verified: false
    },
    {
      email: 'swati.bose@alumni.org',
      fullName: 'Swati Bose',
      graduationYear: 2011,
      department: 'Biotechnology',
      currentJobTitle: 'VP of Bioprocess Development',
      currentCompany: 'Biocon Biologics',
      bio: 'Leading industrial fermentation and monoclonal antibody therapeutic manufacturing.',
      linkedinUrl: 'https://linkedin.com/in/swatibose',
      verified: true,
      seq: 9
    },
    {
      email: 'dev.kapoor@alumni.org',
      fullName: 'Dev Kapoor',
      graduationYear: 2023,
      department: 'Electronics & Communication',
      currentJobTitle: 'Silicon Design Engineer',
      currentCompany: 'Qualcomm',
      bio: 'Working on 5G modem physical layer architecture and low-power ASIC design.',
      linkedinUrl: 'https://linkedin.com/in/devkapoor',
      verified: false
    }
  ];

  const alumni = [];
  for (const item of alumniSeedData) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        roleId: roles[ROLES.ALUMNI].id,
        isActive: true
      },
      create: {
        email: item.email,
        passwordHash,
        roleId: roles[ROLES.ALUMNI].id,
        isActive: true,
        alumniProfile: {
          create: {
            fullName: item.fullName,
            graduationYear: item.graduationYear,
            department: item.department,
            currentJobTitle: item.currentJobTitle,
            currentCompany: item.currentCompany,
            bio: item.bio,
            linkedinUrl: item.linkedinUrl
          }
        }
      },
      include: { alumniProfile: true }
    });
    alumni.push({ ...user, seedConfig: item });
  }
  console.log(`✓ Seeded ${alumni.length} alumni accounts.`);

  // ---------------------------------------------------------------------------
  // 5. Alumni Verification (Number Theory Compliant)
  // ---------------------------------------------------------------------------
  const demoVerificationTokens = {}; // For reporting public tokens
  let maxAllocatedSeq = 0;

  for (const alu of alumni) {
    if (alu.seedConfig.verified && alu.seedConfig.seq) {
      const seq = alu.seedConfig.seq;
      if (seq > maxAllocatedSeq) maxAllocatedSeq = seq;

      // Mathematical affine code: V = (a * seq + b) mod m
      const mathCode = generateVerificationCode(seq);
      const verificationCode = formatVerificationIdentifier(mathCode);

      // Raw public token (24 bytes hex) and its SHA-256 hash
      const rawPublicToken = crypto.randomBytes(24).toString('hex');
      const publicTokenHash = hashToken(rawPublicToken);
      demoVerificationTokens[alu.email] = {
        code: verificationCode,
        sequence: seq,
        rawPublicToken
      };

      await prisma.alumniVerification.upsert({
        where: { alumniProfileId: alu.alumniProfile.id },
        update: {
          status: 'VERIFIED',
          verificationCode,
          publicTokenHash,
          sequenceNumber: seq,
          verifiedById: adminUser.id,
          verifiedAt: new Date('2026-11-01T10:00:00Z'),
          revokedAt: null,
          revokedById: null,
          revocationReason: null
        },
        create: {
          alumniProfileId: alu.alumniProfile.id,
          sequenceNumber: seq,
          verificationCode,
          publicTokenHash,
          status: 'VERIFIED',
          verifiedById: adminUser.id,
          verifiedAt: new Date('2026-11-01T10:00:00Z')
        }
      });
    }
  }

  // Synchronize PostgreSQL sequence to prevent future sequence collisions
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval('alumni_verification_seq', ${Math.max(maxAllocatedSeq, 15)}, true);`
    );
    console.log(`✓ Aligned PostgreSQL sequence 'alumni_verification_seq' to ${Math.max(maxAllocatedSeq, 15)}.`);
  } catch (err) {
    console.log('Notice: setval on sequence skipped or unavailable:', err.message);
  }
  console.log('✓ Seeded number-theory alumni verifications.');

  // ---------------------------------------------------------------------------
  // 6. Jobs (At least 5 across companies, locations, salary ranges)
  // ---------------------------------------------------------------------------
  const jobsData = [
    {
      title: 'Senior Distributed Systems Engineer',
      company: 'Microsoft Azure',
      location: 'Bengaluru, India (Hybrid)',
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Senior',
      salaryMin: 2800000,
      salaryMax: 4200000,
      description: 'Join our cloud infrastructure group designing high-throughput, low-latency distributed state machines and consensus layers. Strong background in C++, Go, or Rust required.',
      applicationDeadline: new Date('2027-04-30T23:59:59Z'),
      isActive: true,
      creatorEmail: 'neha.deshmukh@alumni.org'
    },
    {
      title: 'Autonomous Robotics Software Lead',
      company: 'RoboScale Systems',
      location: 'Pune, India (On-site)',
      employmentType: 'Full-time',
      experienceLevel: 'Lead / Principal',
      salaryMin: 3200000,
      salaryMax: 5000000,
      description: 'Architecting ROS2-based navigation and perception pipelines for 500+ unit industrial AGV fleets. Experience in Kalman filtering, SLAM, and real-time Linux is essential.',
      applicationDeadline: new Date('2027-03-31T23:59:59Z'),
      isActive: true,
      creatorEmail: 'priya.sundaram@alumni.org'
    },
    {
      title: 'Associate Product Manager - Core Payments',
      company: 'FinStack Technologies',
      location: 'Mumbai, India (Hybrid)',
      employmentType: 'Full-time',
      experienceLevel: 'Entry-Level / Associate',
      salaryMin: 1400000,
      salaryMax: 2000000,
      description: 'Drive API specification, merchant onboarding workflows, and developer documentation for cross-border banking rails. Open to recent graduates with strong analytical drive.',
      applicationDeadline: new Date('2027-02-28T23:59:59Z'),
      isActive: true,
      creatorEmail: 'rajesh.sharma@alumni.org'
    },
    {
      title: 'Graduate AI Research Fellow',
      company: 'Google DeepMind',
      location: 'Bengaluru, India (On-site)',
      employmentType: 'Contract / Fellowship',
      experienceLevel: 'Entry-Level',
      salaryMin: 1800000,
      salaryMax: 2400000,
      description: 'Conduct foundational experimentation on reasoning bounds in large transformer architectures. Co-author papers with leading researchers and submit to top-tier conferences.',
      applicationDeadline: new Date('2027-05-15T23:59:59Z'),
      isActive: true,
      creatorEmail: 'ananya.roy@alumni.org'
    },
    {
      title: 'Smart Grid Systems Engineer',
      company: 'SunPower Grids',
      location: 'Ahmedabad, India (On-site)',
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Level',
      salaryMin: 1600000,
      salaryMax: 2600000,
      description: 'Design inverter telemetry, remote PLC monitoring, and dispatch optimization algorithms for 50MW+ utility solar storage projects.',
      applicationDeadline: new Date('2027-06-30T23:59:59Z'),
      isActive: true,
      creatorEmail: 'karan.patel@alumni.org'
    },
    {
      title: 'Fintech Backend Engineer (Go / PostgreSQL)',
      company: 'FinStack Technologies',
      location: 'Remote',
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Level',
      salaryMin: 2000000,
      salaryMax: 3000000,
      description: 'Build mission-critical ledgering services with PostgreSQL row locks, idempotency keys, and zero-downtime database migrations.',
      applicationDeadline: new Date('2027-03-15T23:59:59Z'),
      isActive: true,
      creatorEmail: 'rajesh.sharma@alumni.org'
    }
  ];

  const jobs = [];
  for (const j of jobsData) {
    const creator = alumni.find((a) => a.email === j.creatorEmail) || adminUser;
    const existingJob = await prisma.job.findFirst({
      where: { title: j.title, company: j.company }
    });

    if (existingJob) {
      jobs.push(existingJob);
    } else {
      const created = await prisma.job.create({
        data: {
          title: j.title,
          company: j.company,
          location: j.location,
          employmentType: j.employmentType,
          experienceLevel: j.experienceLevel,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          description: j.description,
          applicationDeadline: j.applicationDeadline,
          isActive: j.isActive,
          createdById: creator.id
        }
      });
      jobs.push(created);
    }
  }
  console.log(`✓ Seeded ${jobs.length} jobs.`);

  // ---------------------------------------------------------------------------
  // 7. Job Applications (From students and alumni with realistic statuses)
  // ---------------------------------------------------------------------------
  const applicationsData = [
    {
      jobIndex: 0, // Azure Systems
      applicantUser: students[0], // Aarav Sharma (CS)
      coverLetter: 'I have built distributed consensus simulators in Go and would love to contribute to Azure storage infrastructure.',
      status: 'SHORTLISTED',
      resumeUrl: 'https://campus-cdn.alumni.org/resumes/aarav_sharma_cv.pdf'
    },
    {
      jobIndex: 2, // FinStack APM
      applicantUser: students[3], // Ishita Verma (IT)
      coverLetter: 'Passionate about fintech UI/UX and API design. Led multiple product hackathon submissions on campus.',
      status: 'PENDING',
      resumeUrl: 'https://campus-cdn.alumni.org/resumes/ishita_verma_cv.pdf'
    },
    {
      jobIndex: 3, // DeepMind AI Fellow
      applicantUser: students[0], // Aarav Sharma (CS)
      coverLetter: 'Published a preprint on reinforcement learning fine-tuning and actively maintain open-source LLM evaluation tools.',
      status: 'UNDER_REVIEW',
      resumeUrl: 'https://campus-cdn.alumni.org/resumes/aarav_sharma_cv.pdf'
    },
    {
      jobIndex: 4, // SunPower Smart Grid
      applicantUser: students[1], // Diya Patel (EE)
      coverLetter: 'Completed my capstone project on microgrid power flow management with solar battery hybridization.',
      status: 'ACCEPTED',
      resumeUrl: 'https://campus-cdn.alumni.org/resumes/diya_patel_cv.pdf'
    },
    {
      jobIndex: 1, // RoboScale Lead
      applicantUser: students[2], // Rohan Mehta (Mech)
      coverLetter: 'Seeking a graduate trainee / apprentice role to learn under industrial autonomous robotics experts.',
      status: 'REJECTED',
      resumeUrl: 'https://campus-cdn.alumni.org/resumes/rohan_mehta_cv.pdf'
    },
    {
      jobIndex: 5, // FinStack Backend
      applicantUser: alumni[11], // Dev Kapoor (ECE Alumni)
      coverLetter: 'Extensive low-level systems programming background seeking to transition into high-performance financial ledgers.',
      status: 'INTERVIEWING',
      resumeUrl: 'https://campus-cdn.alumni.org/resumes/dev_kapoor_cv.pdf'
    }
  ];

  let appCount = 0;
  for (const app of applicationsData) {
    const targetJob = jobs[app.jobIndex];
    if (targetJob && app.applicantUser) {
      await prisma.jobApplication.upsert({
        where: {
          jobId_applicantId: {
            jobId: targetJob.id,
            applicantId: app.applicantUser.id
          }
        },
        update: {
          status: app.status,
          coverLetter: app.coverLetter,
          resumeUrl: app.resumeUrl
        },
        create: {
          jobId: targetJob.id,
          applicantId: app.applicantUser.id,
          status: app.status,
          coverLetter: app.coverLetter,
          resumeUrl: app.resumeUrl
        }
      });
      appCount++;
    }
  }
  console.log(`✓ Seeded ${appCount} job applications.`);

  // ---------------------------------------------------------------------------
  // 8. Events (At least 4: upcoming & past, capacities, dates)
  // ---------------------------------------------------------------------------
  const eventsData = [
    {
      title: 'Annual Global Alumni Gala & Tech Conclave 2027',
      description: 'Keynote panels on generative AI, climate technologies, and quantum computing. Networking luncheon with international chapter chairs.',
      location: 'Grand Institute Auditorium & Virtual Livestream',
      startDate: new Date('2027-01-16T09:00:00Z'),
      endDate: new Date('2027-01-17T18:00:00Z'),
      registrationDeadline: new Date('2027-01-10T23:59:59Z'),
      capacity: 350,
      isActive: true,
      createdById: adminUser.id
    },
    {
      title: 'Spring 2027 Founders & Angel Pitch Day',
      description: 'Ten student-led and recent alumni startups present their MVPs before active alumni angel syndicates and institutional venture capital partners.',
      location: 'Campus Innovation Center, Hall A',
      startDate: new Date('2027-03-20T14:00:00Z'),
      endDate: new Date('2027-03-20T19:30:00Z'),
      registrationDeadline: new Date('2027-03-15T23:59:59Z'),
      capacity: 100,
      isActive: true,
      createdById: alumni[5].id // Rajesh Sharma (FinTech founder)
    },
    {
      title: 'Hands-on Workshop: Microgrid Inverter Control',
      description: 'Deep dive into clean energy microgrid engineering, real-time telemetry protocols, and PLC safety interlocks.',
      location: 'Department of Electrical Engineering, Lab 4',
      startDate: new Date('2027-04-10T10:00:00Z'),
      endDate: new Date('2027-04-10T16:00:00Z'),
      registrationDeadline: new Date('2027-04-05T23:59:59Z'),
      capacity: 40,
      isActive: true,
      createdById: alumni[3].id // Karan Patel (Clean Energy)
    },
    {
      title: 'Decennial Silver Jubilee Reunion (Batch of 2016)',
      description: 'Commemorating 10 years of graduation. Department tours, faculty interactions, sports matches, and an evening banquet.',
      location: 'Heritage Institute Campus Grounds',
      startDate: new Date('2026-10-10T10:00:00Z'),
      endDate: new Date('2026-10-11T20:00:00Z'),
      registrationDeadline: new Date('2026-10-01T23:59:59Z'),
      capacity: 200,
      isActive: false, // Past event
      createdById: adminUser.id
    }
  ];

  const events = [];
  for (const ev of eventsData) {
    const existing = await prisma.event.findFirst({
      where: { title: ev.title }
    });
    if (existing) {
      events.push(existing);
    } else {
      const created = await prisma.event.create({
        data: ev
      });
      events.push(created);
    }
  }
  console.log(`✓ Seeded ${events.length} events.`);

  // ---------------------------------------------------------------------------
  // 9. Event Registrations (Realistic statuses, within capacity)
  // ---------------------------------------------------------------------------
  const registrationsData = [
    { eventIndex: 0, user: students[0], status: 'CONFIRMED' },
    { eventIndex: 0, user: students[1], status: 'CONFIRMED' },
    { eventIndex: 0, user: alumni[0], status: 'CONFIRMED' },
    { eventIndex: 0, user: alumni[2], status: 'CONFIRMED' },
    { eventIndex: 1, user: students[3], status: 'CONFIRMED' },
    { eventIndex: 1, user: alumni[4], status: 'CONFIRMED' },
    { eventIndex: 2, user: students[1], status: 'CONFIRMED' },
    { eventIndex: 2, user: students[2], status: 'WAITLISTED' },
    { eventIndex: 3, user: alumni[3], status: 'ATTENDED' },
    { eventIndex: 3, user: alumni[5], status: 'ATTENDED' }
  ];

  let regCount = 0;
  for (const reg of registrationsData) {
    const targetEvent = events[reg.eventIndex];
    if (targetEvent && reg.user) {
      await prisma.eventRegistration.upsert({
        where: {
          eventId_userId: {
            eventId: targetEvent.id,
            userId: reg.user.id
          }
        },
        update: {
          status: reg.status
        },
        create: {
          eventId: targetEvent.id,
          userId: reg.user.id,
          status: reg.status
        }
      });
      regCount++;
    }
  }
  console.log(`✓ Seeded ${regCount} event registrations.`);

  // ---------------------------------------------------------------------------
  // 10. Mentorship Requests (Connecting students with alumni, diverse states)
  // ---------------------------------------------------------------------------
  const mentorshipData = [
    {
      studentId: students[0].id, // Aarav Sharma (CS)
      mentorId: alumni[2].id, // Neha Deshmukh (Microsoft Azure)
      message: 'Hello Neha maam, I am focusing on distributed consensus protocols and open source. Would love your guidance on cloud architecture careers.',
      status: 'ACCEPTED'
    },
    {
      studentId: students[0].id, // Aarav Sharma (CS)
      mentorId: alumni[4].id, // Ananya Roy (DeepMind)
      message: 'Hi Ananya, I am interested in reinforcement learning research preprints. Seeking advice on doctoral applications abroad.',
      status: 'PENDING'
    },
    {
      studentId: students[1].id, // Diya Patel (EE)
      mentorId: alumni[3].id, // Karan Patel (SunPower Grids)
      message: 'Dear Karan sir, our team is building an embedded battery management module for microgrids. We would be grateful for your industry feedback.',
      status: 'ACCEPTED'
    },
    {
      studentId: students[2].id, // Rohan Mehta (Mech)
      mentorId: alumni[0].id, // Priya Sundaram (RoboScale Systems)
      message: 'Hello Priya, looking for advice on CAD mechatronics transitions and automated warehouse hardware systems.',
      status: 'COMPLETED'
    },
    {
      studentId: students[3].id, // Ishita Verma (IT)
      mentorId: alumni[8].id, // Tanvi Kulkarni (Stripe PM)
      message: 'Hi Tanvi, I am eager to understand product management transitions from an engineering background in fintech companies.',
      status: 'ACCEPTED'
    }
  ];

  for (const m of mentorshipData) {
    const existing = await prisma.mentorshipRequest.findFirst({
      where: {
        studentId: m.studentId,
        mentorId: m.mentorId
      }
    });
    if (!existing) {
      await prisma.mentorshipRequest.create({ data: m });
    } else {
      await prisma.mentorshipRequest.update({
        where: { id: existing.id },
        data: { status: m.status, message: m.message }
      });
    }
  }
  console.log(`✓ Seeded ${mentorshipData.length} mentorship requests.`);

  // ---------------------------------------------------------------------------
  // 11. Donation Campaigns & Transactions
  // ---------------------------------------------------------------------------
  const campaignsData = [
    {
      title: 'Autonomous Robotics & AI Student Lab Endowment',
      description: 'Equipping our undergraduate engineering workshop with modern robotic arms, edge tensor processing units, and high-precision sensors.',
      targetAmount: 5000000.00,
      currency: 'INR',
      startDate: new Date('2026-10-01T00:00:00Z'),
      endDate: new Date('2027-09-30T23:59:59Z'),
      isActive: true
    },
    {
      title: 'Merit & Need-Based Rural Scholars Bursary Fund',
      description: 'Endowment providing 100% tuition scholarships, dorm stipends, and laptop grants to first-generation engineering students from rural districts.',
      targetAmount: 10000000.00,
      currency: 'INR',
      startDate: new Date('2026-08-15T00:00:00Z'),
      endDate: new Date('2027-08-14T23:59:59Z'),
      isActive: true
    },
    {
      title: 'Green Campus Solar Microgrid & Water Harvesting Project',
      description: 'Installing a 200kW rooftop solar array and subterranean rainwater harvesting system to achieve campus net-zero sustainability by 2028.',
      targetAmount: 7500000.00,
      currency: 'INR',
      startDate: new Date('2026-11-01T00:00:00Z'),
      endDate: new Date('2027-10-31T23:59:59Z'),
      isActive: true
    }
  ];

  const campaigns = [];
  for (const c of campaignsData) {
    const existing = await prisma.donationCampaign.findFirst({
      where: { title: c.title }
    });
    if (existing) {
      campaigns.push(existing);
    } else {
      const created = await prisma.donationCampaign.create({
        data: {
          ...c,
          createdById: adminUser.id
        }
      });
      campaigns.push(created);
    }
  }
  console.log(`✓ Seeded ${campaigns.length} donation campaigns.`);

  // Representative Donation Transactions (Simulated payment records)
  const transactionsData = [
    {
      campaignId: campaigns[0].id,
      donorId: alumni[0].id, // Priya Sundaram
      amount: 250000.00,
      currency: 'INR',
      status: 'SUCCESS',
      paymentProvider: 'SIMULATED_GATEWAY',
      providerOrderId: 'sim_order_robotics_001',
      providerPaymentId: 'sim_pay_robotics_001',
      createdAt: new Date('2026-10-25T11:00:00Z')
    },
    {
      campaignId: campaigns[0].id,
      donorId: alumni[5].id, // Rajesh Sharma
      amount: 500000.00,
      currency: 'INR',
      status: 'SUCCESS',
      paymentProvider: 'SIMULATED_GATEWAY',
      providerOrderId: 'sim_order_robotics_002',
      providerPaymentId: 'sim_pay_robotics_002',
      createdAt: new Date('2026-11-02T14:30:00Z')
    },
    {
      campaignId: campaigns[1].id,
      donorId: alumni[2].id, // Neha Deshmukh
      amount: 150000.00,
      currency: 'INR',
      status: 'SUCCESS',
      paymentProvider: 'SIMULATED_GATEWAY',
      providerOrderId: 'sim_order_scholars_001',
      providerPaymentId: 'sim_pay_scholars_001',
      createdAt: new Date('2026-11-05T09:15:00Z')
    },
    {
      campaignId: campaigns[2].id,
      donorId: alumni[3].id, // Karan Patel
      amount: 300000.00,
      currency: 'INR',
      status: 'SUCCESS',
      paymentProvider: 'SIMULATED_GATEWAY',
      providerOrderId: 'sim_order_solar_001',
      providerPaymentId: 'sim_pay_solar_001',
      createdAt: new Date('2026-11-10T16:45:00Z')
    },
    {
      campaignId: campaigns[1].id,
      donorId: alumni[8].id, // Tanvi Kulkarni
      amount: 50000.00,
      currency: 'INR',
      status: 'PENDING',
      paymentProvider: 'SIMULATED_GATEWAY',
      providerOrderId: 'sim_order_scholars_002',
      providerPaymentId: 'sim_pay_scholars_pending_002',
      createdAt: new Date('2026-11-18T18:00:00Z')
    }
  ];

  for (const tx of transactionsData) {
    const existing = await prisma.donationTransaction.findUnique({
      where: { providerPaymentId: tx.providerPaymentId }
    });
    if (!existing) {
      await prisma.donationTransaction.create({ data: tx });
    }
  }
  console.log(`✓ Seeded ${transactionsData.length} donation transactions.`);

  // ---------------------------------------------------------------------------
  // 12. Feedback (Valid ratings 1..5, varied categories and statuses)
  // ---------------------------------------------------------------------------
  const feedbackData = [
    {
      category: 'DIRECTORY_SEARCH',
      subject: 'Great search filters for department and graduation year',
      rating: 5,
      message: 'The composite directory indexing makes browsing alumni profiles across specific graduation batches instantaneous. Great improvements!',
      status: 'REVIEWED'
    },
    {
      category: 'MENTORSHIP_PAIRING',
      subject: 'Mentorship request notifications',
      rating: 4,
      message: 'The pairing workflow is smooth. It would be helpful to receive an email notification when a student submits an inquiry.',
      status: 'PENDING'
    },
    {
      category: 'ALUMNI_VERIFICATION',
      subject: 'Mathematical verification certificate verification',
      rating: 5,
      message: 'Verified my digital certificate using the public verification lookup. The number-theory verification identifier is transparent and authentic.',
      status: 'REVIEWED'
    },
    {
      category: 'EVENT_REGISTRATION',
      subject: 'Event seat reservation and capacity feedback',
      rating: 4,
      message: 'The registration lock prevented double booking during the Gala registration rush. Everything worked reliably.',
      status: 'PENDING'
    },
    {
      category: 'PLATFORM_EXPERIENCE',
      subject: 'Mobile navigation drawer responsiveness',
      rating: 3,
      message: 'Platform runs smoothly on desktop, but the mobile drawer menu could benefit from smoother transition animations on smaller screens.',
      status: 'RESOLVED'
    }
  ];

  for (const fb of feedbackData) {
    const existing = await prisma.feedback.findFirst({
      where: { subject: fb.subject }
    });
    if (!existing) {
      await prisma.feedback.create({ data: fb });
    }
  }
  console.log(`✓ Seeded ${feedbackData.length} feedback records.`);

  // ---------------------------------------------------------------------------
  // 13. Success Stories (Published and draft stories)
  // ---------------------------------------------------------------------------
  const storiesData = [
    {
      title: 'From Campus Robotics Laboratory to Series A Startup Founder',
      content: 'A deep dive into how our undergraduate robotics projects fostered the core vision behind RoboScale, an autonomous warehouse solutions company that recently closed an $8M Series A funding round.\n\nWhen we started building miniature automated guided vehicles in the engineering lab during our third year, we had no idea it would evolve into a multi-million-dollar robotics firm. The encouragement of our professors, the late-night hackathons with classmates, and the strong foundation in mechanical design made all the difference.\n\nToday, RoboScale deploys robots across 40 distribution hubs nationwide. To current students: build real things, collaborate with people outside your major, and do not be afraid to fail early.',
      isPublished: true,
      publishedAt: new Date('2026-10-22T09:30:00.000Z'),
      authorId: alumni[0].id // Priya Sundaram
    },
    {
      title: 'Pioneering Quantum Computing Research at CERN',
      content: 'Reflecting on ten years in physics and quantum systems, and how the rigorous foundational coursework shaped my trajectory to the frontiers of international scientific research.\n\nNavigating graduate school and European research institutes was daunting, but the institute emphasis on analytical thinking and mathematical rigor gave me an enduring edge. We are now experimenting with superconducting quantum processors capable of simulating complex molecular interactions.\n\nMy advice to aspiring researchers is simple: read primary literature early, learn how to communicate complex ideas clearly, and seek out faculty mentors who challenge your assumptions.',
      isPublished: true,
      publishedAt: new Date('2026-11-03T10:00:00.000Z'),
      authorId: alumni[1].id // Vikramaditya Sen
    },
    {
      title: 'Building Open-Source Cloud Infrastructure for Millions',
      content: 'Reflecting on open-source software contributions, distributed systems architecture, and empowering developers worldwide.\n\nStarting as a student contributor to cloud-native projects, I discovered the tremendous power of global open-source communities. Today at Microsoft, I help design distributed storage layers that power critical cloud workloads.\n\nContributing to open source teaches you version control, code review rigor, asynchronous collaboration, and empathy for users across the globe. Never wait for permission to write code that helps others.',
      isPublished: true,
      publishedAt: new Date('2026-11-08T14:15:00.000Z'),
      authorId: alumni[2].id // Neha Deshmukh
    },
    {
      title: 'Transforming Rural Energy Grids with Sustainable Microgrids',
      content: 'How sustainable power distribution engineering and community-led solar installations are transforming agricultural productivity in rural districts.\n\nClean energy is more than just technology; it is socioeconomic empowerment. Our team has commissioned 24 hybrid solar-battery microgrids, powering irrigation pumps and cold-storage facilities for over 15,000 farmers.\n\nEngineering education must remain deeply connected to societal challenges. I encourage every student to spend time observing real problems in villages and small towns before deciding what problems to dedicate their careers to solving.',
      isPublished: true,
      publishedAt: new Date('2026-11-12T16:00:00.000Z'),
      authorId: alumni[3].id // Karan Patel
    },
    {
      title: 'Designing Resilient Smart Cities for Climate Adaptation',
      content: 'Exploring how urban planners and civil engineers can implement nature-based stormwater management and seismic resilience in dense metropolitan hubs. As extreme weather patterns intensify, urban centers require holistic engineering that bridges civil infrastructure with ecological preservation.',
      isPublished: false, // Draft story
      publishedAt: null,
      authorId: alumni[6].id // Meera Nair
    }
  ];

  for (const s of storiesData) {
    const existing = await prisma.successStory.findFirst({
      where: { title: s.title }
    });
    if (!existing) {
      await prisma.successStory.create({ data: s });
    }
  }
  console.log(`✓ Seeded ${storiesData.length} alumni success stories.`);

  console.log('=== Database Seeding Complete Successfully ===');
  return { demoVerificationTokens };
}

main()
  .then((res) => {
    if (res?.demoVerificationTokens) {
      console.log('\n--- Sample Verified Alumni Identifiers & Verification Tokens ---');
      for (const [email, info] of Object.entries(res.demoVerificationTokens)) {
        console.log(`Alumni: ${email} | Code: ${info.code} (Seq: ${info.sequence}) | Token: ${info.rawPublicToken}`);
      }
    }
  })
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
