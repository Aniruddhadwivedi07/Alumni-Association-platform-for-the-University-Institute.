/**
 * Demo / Placeholder Events Content
 *
 * NOTE: These events are realistic-looking but fictional placeholders.
 * Displayed ONLY when the API returns an empty array.
 * Each event is clearly labeled as a DEMO EVENT.
 * Actual registrations are disabled for demo events.
 * Never inserted into PostgreSQL or sent to backend endpoints.
 */

export const DEMO_EVENTS = [
  {
    id: 'demo-event-1',
    isDemo: true,
    title: 'Annual Alumni Grand Reunion 2026',
    category: 'Reunion',
    startDate: '2026-12-19T09:30:00.000Z',
    endDate: '2026-12-20T18:00:00.000Z',
    registrationDeadline: '2026-12-15T18:30:00.000Z',
    location: 'Main Campus Auditorium & Central Lawn, GEC',
    isOnline: false,
    capacity: 600,
    registeredCount: 342,
    registrationStatus: 'Upcoming',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    description: 'Welcome back home! Join over 500 alumni spanning batches from 1985 to 2026 for a weekend of nostalgic walks, keynote addresses, distinguished alumni honors, and an evening cultural banquet under the stars.',
    highlights: ['Distinguished Alumni Awards', 'Campus History Walk', 'Alumni-Student Interaction Hour', 'Dinner Gala']
  },
  {
    id: 'demo-event-2',
    isDemo: true,
    title: 'AI & Future Technologies Global Summit',
    category: 'Technology',
    startDate: '2026-12-05T14:00:00.000Z',
    endDate: '2026-12-05T19:30:00.000Z',
    registrationDeadline: '2026-12-03T18:30:00.000Z',
    location: 'Online (Virtual Conference Arena)',
    isOnline: true,
    capacity: 1000,
    registeredCount: 780,
    registrationStatus: 'Upcoming',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    description: 'A global virtual gathering featuring pioneering alumni researchers and industry leaders from Google, DeepMind, Microsoft, and OpenAI discussing generative AI breakthroughs, safety alignment, and agentic workflows.',
    highlights: ['Keynotes from AI Founders', 'Breakout Workshops on LLM Fine-Tuning', 'Live Q&A with Senior Researchers']
  },
  {
    id: 'demo-event-3',
    isDemo: true,
    title: 'Alumni Career Networking Night & Speed Mentoring',
    category: 'Networking',
    startDate: '2026-12-12T18:00:00.000Z',
    endDate: '2026-12-12T21:30:00.000Z',
    registrationDeadline: '2026-12-10T18:30:00.000Z',
    location: 'Grand Ballroom, The Lalit, Bengaluru & Virtual Stream',
    isOnline: false,
    capacity: 250,
    registeredCount: 195,
    registrationStatus: 'Upcoming',
    coverImage: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    description: 'Connect directly with senior alumni directors, recruiters, and engineering leaders. Designed to foster career mobility, resume feedback, and direct hiring referrals for early-career alumni and graduating seniors.',
    highlights: ['Speed Mentoring Tables', 'Executive Networking Cocktail', 'Dedicated Tech & Core Engineering Booths']
  },
  {
    id: 'demo-event-4',
    isDemo: true,
    title: 'Entrepreneurship & Startup Conclave 2026',
    category: 'Entrepreneurship',
    startDate: '2027-01-09T10:00:00.000Z',
    endDate: '2027-01-09T17:30:00.000Z',
    registrationDeadline: '2027-01-06T18:30:00.000Z',
    location: 'Incubation Center & Innovation Hub, GEC Campus',
    isOnline: false,
    capacity: 300,
    registeredCount: 160,
    registrationStatus: 'Upcoming',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    description: 'Showcasing campus founders and alumni venture builders. Featuring live pitch battles for seed incubation grants, VC panel discussions on fundraising in 2027, and 1-on-1 office hours with angel investors.',
    highlights: ['Pitch Deck Reviews', 'Angel Investor Fireside Chat', 'Product Demo Stalls']
  },
  {
    id: 'demo-event-5',
    isDemo: true,
    title: 'FinTech Innovation & Real-Time Rails Workshop',
    category: 'Workshop',
    startDate: '2027-01-16T15:00:00.000Z',
    endDate: '2027-01-16T18:30:00.000Z',
    registrationDeadline: '2027-01-14T18:30:00.000Z',
    location: 'Online (Interactive Zoom Studio)',
    isOnline: true,
    capacity: 400,
    registeredCount: 220,
    registrationStatus: 'Upcoming',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    description: 'Hands-on architectural masterclass dissecting high-throughput payment rails, distributed consensus for ledger state, and regulatory APIs. Led by alumni VP of Engineering at international payment gateways.',
    highlights: ['Live Code Architecture Teardown', 'Security & Idempotency Best Practices', 'Certificate of Participation']
  },
  {
    id: 'demo-event-6',
    isDemo: true,
    title: 'Alumni Mentorship Winter Meetup',
    category: 'Mentorship',
    startDate: '2027-01-23T11:00:00.000Z',
    endDate: '2027-01-23T14:30:00.000Z',
    registrationDeadline: '2027-01-21T18:30:00.000Z',
    location: 'Seminar Hall 2, Student Activity Complex, GEC',
    isOnline: false,
    capacity: 150,
    registeredCount: 94,
    registrationStatus: 'Upcoming',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    description: 'An informal mentorship exchange uniting student mentees with seasoned alumni guides. Features breakout circles on postgraduate study abroad, interview prep strategies, and leadership in corporate environments.',
    highlights: ['Group Mentoring Circles', 'Resume Review Clinics', 'Networking Lunch']
  }
]
