/**
 * Demo / Placeholder Job Listings
 *
 * NOTE: These jobs are realistic-looking but fictional placeholders.
 * Displayed ONLY when the API returns an empty array.
 * Each listing is clearly labeled as a DEMO LISTING.
 * Applications cannot be submitted for demo listings.
 * Never inserted into PostgreSQL or sent to backend endpoints.
 */

export const DEMO_JOBS = [
  {
    id: 'demo-job-1',
    isDemo: true,
    title: 'Senior Full-Stack Engineer (Cloud Platforms)',
    company: 'ApexCloud Systems',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    location: 'Bengaluru, India (Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Senior Level (4-7 years)',
    salaryRange: '₹28,00,000 - ₹38,00,000 PA',
    category: 'Software Development',
    department: 'Computer Science & Engineering',
    applicationDeadline: '2026-12-30T18:30:00.000Z',
    description: 'Looking for a Senior Full-Stack Engineer to architect resilient distributed systems, build customer-facing dashboards in React/Next.js, and scale event-driven Node.js & Go microservices on AWS/GCP Kubernetes clusters. You will collaborate closely with product management and mentor junior engineers across regional hubs.',
    skillsRequired: ['React', 'Node.js', 'Go', 'Kubernetes', 'PostgreSQL', 'AWS'],
    postedAt: '2026-11-10T10:00:00.000Z'
  },
  {
    id: 'demo-job-2',
    isDemo: true,
    title: 'Machine Learning / AI Research Engineer',
    company: 'NeuralSphere AI Labs',
    companyLogo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=200&q=80',
    location: 'Hyderabad, India (On-site / Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-Senior Level (3-5 years)',
    salaryRange: '₹32,00,000 - ₹45,00,000 PA',
    category: 'AI/ML Engineering',
    department: 'Artificial Intelligence & Data Science',
    applicationDeadline: '2027-01-15T18:30:00.000Z',
    description: 'NeuralSphere is developing next-generation multimodal vision and language architectures. In this role, you will implement novel transformer models, optimize GPU inference pipelines using TensorRT/vLLM, and run rigorous benchmarks on domain-specific datasets in medical and legal analytics.',
    skillsRequired: ['PyTorch', 'Transformers', 'CUDA', 'Python', 'vLLM', 'Model Fine-Tuning'],
    postedAt: '2026-11-12T09:30:00.000Z'
  },
  {
    id: 'demo-job-3',
    isDemo: true,
    title: 'Lead Data Analytics Consultant',
    company: 'QuantEdge Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80',
    location: 'Mumbai, India (Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Lead / Principal (5+ years)',
    salaryRange: '₹24,00,000 - ₹34,00,000 PA',
    category: 'Data Analytics',
    department: 'Information Technology',
    applicationDeadline: '2026-12-28T18:30:00.000Z',
    description: 'Lead high-impact analytics workstreams for Fortune 500 enterprise clients. You will design Snowflake/BigQuery data marts, build dbt transformation models, and translate complex operational metrics into actionable executive dashboards.',
    skillsRequired: ['SQL', 'Snowflake', 'dbt', 'Tableau', 'Python', 'Statistical Modeling'],
    postedAt: '2026-11-08T11:00:00.000Z'
  },
  {
    id: 'demo-job-4',
    isDemo: true,
    title: 'Technical Product Manager — Developer Platforms',
    company: 'Nexus Gateway Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=200&q=80',
    location: 'Remote (India-wide)',
    employmentType: 'Full-time',
    experienceLevel: 'Mid Level (3-6 years)',
    salaryRange: '₹26,00,000 - ₹36,00,000 PA',
    category: 'Product Management',
    department: 'Computer Science & Engineering',
    applicationDeadline: '2027-01-05T18:30:00.000Z',
    description: 'Define the roadmap for Nexus developer portals, API authentication gateways, and client SDKs. You will lead cross-functional sprint ceremonies, conduct qualitative developer interviews, and maintain API SLA benchmarks across international deployments.',
    skillsRequired: ['API Design', 'Roadmapping', 'Agile/Scrum', 'Developer Experience', 'Metrics & KPIs'],
    postedAt: '2026-11-05T14:15:00.000Z'
  },
  {
    id: 'demo-job-5',
    isDemo: true,
    title: 'Senior FinTech Backend Engineer (Payments)',
    company: 'CredoPay Financial Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80',
    location: 'Bengaluru / Pune, India',
    employmentType: 'Full-time',
    experienceLevel: 'Senior Level (4-8 years)',
    salaryRange: '₹30,00,000 - ₹42,00,000 PA',
    category: 'FinTech',
    department: 'Information Technology',
    applicationDeadline: '2027-01-20T18:30:00.000Z',
    description: 'Help engineer high-reliability payments settlement infrastructure processing millions of real-time transactions daily. Experience with double-entry ledgers, idempotency keys, ISO 20022 message formats, and distributed transactions is highly valued.',
    skillsRequired: ['Java / Kotlin / Go', 'PostgreSQL', 'Kafka', 'Redis', 'FinTech Protocols'],
    postedAt: '2026-11-14T08:00:00.000Z'
  },
  {
    id: 'demo-job-6',
    isDemo: true,
    title: 'Graduate Software Development Engineer (Batch 2026/2027)',
    company: 'HyperScale Mobility Software',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&q=80',
    location: 'Gurugram, India (On-site)',
    employmentType: 'Full-time',
    experienceLevel: 'Entry Level (0-1 years)',
    salaryRange: '₹12,00,000 - ₹16,00,000 PA',
    category: 'Software Development',
    department: 'Electronics & Communication',
    applicationDeadline: '2026-12-25T18:30:00.000Z',
    description: 'Designed exclusively for recent college graduates and final-year students. You will participate in intensive 12-week rotational onboarding spanning backend APIs, cloud deployment automation, and modern frontend frameworks with dedicated mentorship from senior engineering leads.',
    skillsRequired: ['Data Structures & Algorithms', 'C++ or Java or Python', 'SQL', 'Git', 'Linux Basics'],
    postedAt: '2026-11-13T16:00:00.000Z'
  }
]
