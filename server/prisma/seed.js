require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/prisma');
const { ROLES } = require('../src/constants/roles');

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Roles
  const roles = {};
  for (const name of Object.values(ROLES)) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✓ Roles seeded:', Object.keys(roles).join(', '));

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@alumni.org' },
    update: {
      roleId: roles[ROLES.ADMIN].id,
      isActive: true,
    },
    create: {
      email: 'admin@alumni.org',
      passwordHash,
      roleId: roles[ROLES.ADMIN].id,
      isActive: true,
      alumniProfile: {
        create: {
          fullName: 'Platform Administrator',
          graduationYear: 2012,
          department: 'Computer Science & Engineering',
          currentJobTitle: 'Director of Alumni Relations',
          currentCompany: 'Alumni Association',
          bio: 'Coordinating global alumni engagement, campus initiatives, and student mentorship.',
          linkedinUrl: 'https://linkedin.com'
        }
      }
    },
  });
  console.log('✓ Admin user verified:', adminUser.email);

  // 3. Seed Realistic Alumni Profiles
  const alumniData = [
    {
      email: 'priya.sundaram@alumni.org',
      fullName: 'Priya Sundaram',
      graduationYear: 2017,
      department: 'Mechanical Engineering',
      currentJobTitle: 'VP of Engineering',
      currentCompany: 'RoboScale Systems',
      bio: 'Co-founder of an autonomous warehouse robotics platform. Passionate about hardware design, mechatronics, and mentoring students in robotics.',
      linkedinUrl: 'https://linkedin.com/in/priyasundaram'
    },
    {
      email: 'vikram.sen@alumni.org',
      fullName: 'Dr. Vikramaditya Sen',
      graduationYear: 2014,
      department: 'Electronics & Communication',
      currentJobTitle: 'Quantum Research Scientist',
      currentCompany: 'CERN Laboratory',
      bio: 'Postdoctoral researcher working on superconducting quantum circuits and cryogenic measurement instruments. Enthusiastic about fundamental physics.',
      linkedinUrl: 'https://linkedin.com/in/vikramsen'
    },
    {
      email: 'neha.deshmukh@alumni.org',
      fullName: 'Neha Deshmukh',
      graduationYear: 2020,
      department: 'Computer Science & Engineering',
      currentJobTitle: 'Staff Software Engineer',
      currentCompany: 'Microsoft Azure',
      bio: 'Distributed systems architect and open-source contributor. Dedicated to mentoring women entering software engineering and cloud computing.',
      linkedinUrl: 'https://linkedin.com/in/nehadeshmukh'
    },
    {
      email: 'karan.patel@alumni.org',
      fullName: 'Karan Patel',
      graduationYear: 2016,
      department: 'Electrical Engineering',
      currentJobTitle: 'Director of Clean Energy',
      currentCompany: 'SunPower Grids',
      bio: 'Deploying hybrid solar microgrids across emerging rural regions. Committed to sustainable infrastructure and clean technology innovations.',
      linkedinUrl: 'https://linkedin.com/in/karanpatel'
    },
    {
      email: 'ananya.roy@alumni.org',
      fullName: 'Ananya Roy',
      graduationYear: 2021,
      department: 'Artificial Intelligence & Data Science',
      currentJobTitle: 'Machine Learning Research Engineer',
      currentCompany: 'Google DeepMind',
      bio: 'Working on multimodal reasoning models and reinforcement learning. Always excited to review student preprints and discuss research careers.',
      linkedinUrl: 'https://linkedin.com/in/ananyaroy'
    },
    {
      email: 'rajesh.sharma@alumni.org',
      fullName: 'Rajesh Sharma',
      graduationYear: 2015,
      department: 'Information Technology',
      currentJobTitle: 'Founder & CEO',
      currentCompany: 'FinStack Technologies',
      bio: 'Serial entrepreneur building core banking APIs. Passionate about angel investing, fintech products, and student-led startup incubation.',
      linkedinUrl: 'https://linkedin.com/in/rajeshsharma'
    },
    {
      email: 'meera.nair@alumni.org',
      fullName: 'Meera Nair',
      graduationYear: 2019,
      department: 'Civil Engineering',
      currentJobTitle: 'Senior Infrastructure Consultant',
      currentCompany: 'ARUP Group',
      bio: 'Designing climate-resilient transit and flood-resilient coastal urban infrastructure throughout South and Southeast Asia.',
      linkedinUrl: 'https://linkedin.com/in/meeranair'
    },
    {
      email: 'siddharth.verma@alumni.org',
      fullName: 'Siddharth Verma',
      graduationYear: 2018,
      department: 'Business Administration',
      currentJobTitle: 'Partner',
      currentCompany: 'Peak Horizon Ventures',
      bio: 'Venture investor backing high-growth technology startups across India and Southeast Asia. Organizing campus venture capital workshops.',
      linkedinUrl: 'https://linkedin.com/in/siddharthverma'
    }
  ];

  const seededAlumniUsers = [];
  for (const person of alumniData) {
    const user = await prisma.user.upsert({
      where: { email: person.email },
      update: {
        roleId: roles[ROLES.ALUMNI].id,
        isActive: true,
      },
      create: {
        email: person.email,
        passwordHash,
        roleId: roles[ROLES.ALUMNI].id,
        isActive: true,
        alumniProfile: {
          create: {
            fullName: person.fullName,
            graduationYear: person.graduationYear,
            department: person.department,
            currentJobTitle: person.currentJobTitle,
            currentCompany: person.currentCompany,
            bio: person.bio,
            linkedinUrl: person.linkedinUrl
          }
        }
      },
      include: {
        alumniProfile: true
      }
    });

    // If profile already existed without updated fields, sync profile
    if (user.alumniProfile) {
      await prisma.alumniProfile.update({
        where: { id: user.alumniProfile.id },
        data: {
          fullName: person.fullName,
          graduationYear: person.graduationYear,
          department: person.department,
          currentJobTitle: person.currentJobTitle,
          currentCompany: person.currentCompany,
          bio: person.bio,
          linkedinUrl: person.linkedinUrl
        }
      });
    }

    seededAlumniUsers.push(user);
  }
  console.log(`✓ Seeded ${seededAlumniUsers.length} verified alumni profiles.`);

  // 4. Seed Donation Campaigns
  const campaignsData = [
    {
      title: 'Merit & Need-Based Student Scholarship Fund',
      description: 'Providing full-tuition scholarships, laptop grants, and living stipends for talented students facing economic hardship. Every donation directly funds access to higher education and ensures no student abandons their studies due to financial distress.',
      targetAmount: 1000000.00,
      currency: 'INR',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      isActive: true,
    },
    {
      title: 'Next-Gen Robotics & AI Innovation Laboratory',
      description: 'Equipping our collegiate engineering labs with advanced GPU workstations, collaborative robot arms, sensors, and rapid 3D printing equipment to support competitive coding, international hackathons, and breakthrough student research.',
      targetAmount: 2500000.00,
      currency: 'INR',
      startDate: new Date('2026-02-01T00:00:00.000Z'),
      isActive: true,
    },
    {
      title: 'Alumni Student Welfare & Emergency Relief Fund',
      description: 'A rapid-disbursement emergency fund to assist enrolled students facing unforeseen personal, medical, or family crises during the academic year.',
      targetAmount: 500000.00,
      currency: 'INR',
      startDate: new Date('2026-03-01T00:00:00.000Z'),
      isActive: true,
    }
  ];

  for (const camp of campaignsData) {
    const existing = await prisma.donationCampaign.findFirst({
      where: { title: camp.title }
    });
    if (!existing) {
      await prisma.donationCampaign.create({
        data: {
          ...camp,
          createdById: adminUser.id
        }
      });
    }
  }
  console.log('✓ Seeded active donation campaigns.');

  // 5. Seed Success Stories
  const storiesData = [
    {
      title: 'From Campus Laboratory to Series A Startup Founder',
      content: 'A deep dive into how our undergraduate robotics projects fostered the core vision behind RoboScale, an autonomous warehouse solutions company that recently closed an $8M Series A funding round.\n\nWhen we started building miniature automated guided vehicles in the engineering lab during our third year, we had no idea it would evolve into a multi-million-dollar robotics firm. The encouragement of our professors, the late-night hackathons with classmates, and the strong foundation in mechanical design made all the difference.\n\nToday, RoboScale deploys robots across 40 distribution hubs nationwide. To current students: build real things, collaborate with people outside your major, and don\'t be afraid to fail early.',
      isPublished: true,
      publishedAt: new Date('2026-10-22T09:30:00.000Z'),
      authorId: seededAlumniUsers[0].id
    },
    {
      title: 'Pioneering Quantum Computing Research at CERN',
      content: 'Reflecting on ten years in physics and quantum systems, and how the rigorous foundational coursework shaped my trajectory to the frontiers of international scientific research.\n\nNavigating graduate school and European research institutes was daunting, but the institute\'s emphasis on analytical thinking and mathematical rigor gave me an enduring edge. We are now experimenting with superconducting quantum processors capable of simulating complex molecular interactions.\n\nMy advice to aspiring researchers is simple: read primary literature early, learn how to communicate complex ideas clearly, and seek out faculty mentors who challenge your assumptions.',
      isPublished: true,
      publishedAt: new Date('2026-11-03T10:00:00.000Z'),
      authorId: seededAlumniUsers[1].id
    },
    {
      title: 'Building Open-Source Cloud Infrastructure for Millions',
      content: 'Reflecting on open-source software contributions, distributed systems architecture, and empowering developers worldwide.\n\nStarting as a student contributor to cloud-native projects, I discovered the tremendous power of global open-source communities. Today at Microsoft, I help design distributed storage layers that power critical cloud workloads.\n\nContributing to open source teaches you version control, code review rigor, asynchronous collaboration, and empathy for users across the globe. Never wait for permission to write code that helps others.',
      isPublished: true,
      publishedAt: new Date('2026-11-08T14:15:00.000Z'),
      authorId: seededAlumniUsers[2].id
    },
    {
      title: 'Transforming Rural Energy Grids with Sustainable Microgrids',
      content: 'How sustainable power distribution engineering and community-led solar installations are transforming agricultural productivity in rural districts.\n\nClean energy is more than just technology; it is socioeconomic empowerment. Our team has commissioned 24 hybrid solar-battery microgrids, powering irrigation pumps and cold-storage facilities for over 15,000 farmers.\n\nEngineering education must remain deeply connected to societal challenges. I encourage every student to spend time observing real problems in villages and small towns before deciding what problems to dedicate their careers to solving.',
      isPublished: true,
      publishedAt: new Date('2026-11-12T16:00:00.000Z'),
      authorId: seededAlumniUsers[3].id
    },
    {
      title: 'Designing Resilient Smart Cities for Climate Adaptation',
      content: 'Exploring how urban planners and civil engineers can implement nature-based stormwater management and seismic resilience in dense metropolitan hubs. As extreme weather patterns intensify, urban centers require holistic engineering that bridges civil infrastructure with ecological preservation.',
      isPublished: false,
      publishedAt: null,
      authorId: seededAlumniUsers[6].id
    }
  ];

  for (const s of storiesData) {
    const existing = await prisma.successStory.findFirst({
      where: { title: s.title }
    });
    if (!existing) {
      await prisma.successStory.create({
        data: s
      });
    }
  }
  console.log('✓ Seeded published and draft alumni success stories.');

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
