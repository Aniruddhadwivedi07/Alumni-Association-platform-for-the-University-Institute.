import { Link } from 'react-router-dom'
import Section from '../components/Section'

export default function AlumniAssociation() {
  const activities = [
    {
      title: 'Annual Reunions & Meets',
      description: 'Bringing milestone anniversary batches together on campus to reconnect with professors, peers, and departments.',
      tag: 'Community',
    },
    {
      title: 'Alumni-Student Mentorship',
      description: 'Structured 1-on-1 and group mentorship sessions guiding students through higher studies, career transitions, and industry interview preparation.',
      tag: 'Mentorship',
    },
    {
      title: 'Career & Talent Network',
      description: 'An exclusive job and internship board where alumni recruit directly from GEC talent pool.',
      tag: 'Careers',
    },
    {
      title: 'Distinguished Speaker Series',
      description: 'Inviting accomplished alumni entrepreneurs, executives, and researchers to deliver keynote lectures and hands-on workshops.',
      tag: 'Knowledge Sharing',
    },
    {
      title: 'Institutional Development & Grants',
      description: 'Channelling alumni contributions into modern laboratory upgrades, competitive coding clubs, and student emergency grants.',
      tag: 'Philanthropy',
    },
    {
      title: 'Alumni Recognition Awards',
      description: 'Honoring outstanding contributions of alumni in engineering, entrepreneurship, public service, and academia.',
      tag: 'Recognition',
    },
  ]

  const tiers = [
    {
      title: 'Current Student',
      benefit: 'Access alumni directory, seek mentorship, browse job listings, and attend campus networking sessions.',
      cta: 'Explore Opportunities',
      link: '/about',
    },
    {
      title: 'Alumni Member',
      benefit: 'Connect with global batchmates, mentor students, post job openings, and participate in alumni elections.',
      cta: 'Connect With Alma Mater',
      link: '/contact',
    },
    {
      title: 'Honorary / Faculty',
      benefit: 'Engage with former students, invite alumni for guest lectures, and collaborate on institutional development.',
      cta: 'Get In Touch',
      link: '/contact',
    },
  ]

  return (
    <>
      {/* Header Banner */}
      <section className="bg-indigo-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
            Government Engineering College
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            The Alumni Association
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-indigo-100">
            A self-governing body of graduates dedicated to fostering alumni engagement, professional empowerment, and lasting ties with Government Engineering College.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/about"
              className="rounded-lg bg-white px-5 py-3 font-semibold text-indigo-950 transition hover:bg-indigo-50"
            >
              Our Mission & History
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-indigo-300 px-5 py-3 font-semibold text-white transition hover:bg-indigo-900"
            >
              Contact the Executive Cell
            </Link>
          </div>
        </div>
      </section>

      {/* Overview & Charter */}
      <Section id="charter" title="Our Mandate and Structure">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-lg leading-relaxed text-slate-600">
            <p>
              Established as an official liaison body, the GEC Alumni Association serves as the bridge between thousands of alumni dispersed worldwide and our academic departments.
            </p>
            <p>
              The Association is governed by an elected executive council consisting of alumni representatives, the Principal as Patron, and a dedicated faculty coordinator ensuring seamless coordination.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-indigo-950">Association Highlights</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-700">✓</span>
                <span>Representing multiple decades of engineering graduates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-700">✓</span>
                <span>Regional chapters across major technology hubs and overseas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-700">✓</span>
                <span>Active engagement with campus training & placement cells.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-700">✓</span>
                <span>Transparent governance and annual general body meetings (AGM).</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Core Activities */}
      <div className="bg-slate-50">
        <Section id="activities" title="Our Core Activities & Initiatives">
          <p className="mb-10 max-w-2xl leading-relaxed text-slate-600">
            From annual reunions and masterclasses to institutional philanthropy, our ongoing initiatives keep the spirit of alma mater thriving.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {activities.map((act) => (
              <article key={act.title} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="self-start rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {act.tag}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{act.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{act.description}</p>
              </article>
            ))}
          </div>
        </Section>
      </div>

      {/* Membership Community Tiers */}
      <Section id="membership" title="Who Can Participate?">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.title} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-bold text-indigo-950">{tier.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{tier.benefit}</p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  to={tier.link}
                  className="inline-block text-sm font-semibold text-indigo-700 hover:underline"
                >
                  {tier.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <section className="border-t border-slate-200 bg-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold">Stay Engaged With Your Alma Mater</h2>
          <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
            Whether you graduated last year or forty years ago, your insights and journey matter to our community. Connect with the alumni association today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-950 transition hover:bg-indigo-50"
            >
              Get in Touch With Us
            </Link>
            <Link
              to="/about"
              className="rounded-lg border border-indigo-300 px-6 py-3 font-semibold text-white transition hover:bg-indigo-800"
            >
              Read About Our Mission
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
