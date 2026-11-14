import { Link } from 'react-router-dom'
import Section from '../components/Section'

export default function AlumniAssociation() {
  const activities = [
    {
      title: 'Annual Reunions & Meets',
      description: 'Bringing milestone cohort batches together on campus to reconnect with professors, peers, and departments.',
      tag: 'Community',
    },
    {
      title: 'Alumni-Student Mentorship',
      description: 'Structured 1-on-1 and group mentorship sessions guiding students through technical interviews, system design, and career growth.',
      tag: 'Mentorship',
    },
    {
      title: 'Career & Talent Network',
      description: 'An exclusive job and internship referral board where alumni recruit directly from the NST talent pool.',
      tag: 'Careers',
    },
    {
      title: 'Distinguished Tech Speaker Series',
      description: 'Inviting accomplished alumni engineers, founders, and researchers to deliver keynote lectures and hands-on workshops.',
      tag: 'Knowledge Sharing',
    },
    {
      title: 'Institutional Development & Hackathons',
      description: 'Channelling alumni contributions into modern campus tech labs, competitive coding initiatives, and student project grants.',
      tag: 'Philanthropy',
    },
    {
      title: 'Alumni Recognition Awards',
      description: 'Honoring outstanding contributions of alumni in software engineering, AI, entrepreneurship, and public service.',
      tag: 'Recognition',
    },
  ]

  const tiers = [
    {
      title: 'Current Student',
      benefit: 'Access alumni directory, seek 1-on-1 mentorship, browse job listings, and attend campus networking sessions.',
      cta: 'Explore Opportunities',
      link: '/about',
    },
    {
      title: 'Alumni Member',
      benefit: 'Connect with global batchmates, mentor junior students, post job openings, and participate in alumni initiatives.',
      cta: 'Connect With Alma Mater',
      link: '/contact',
    },
    {
      title: 'Honorary / Faculty',
      benefit: 'Engage with former students, invite alumni for tech guest lectures, and collaborate on institutional development.',
      cta: 'Get In Touch',
      link: '/contact',
    },
  ]

  return (
    <>
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#064477] to-[#002D54] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">
            Newton School of Technology
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            The NST Alumni Association
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-sky-100">
            A self-governing body of graduates dedicated to fostering alumni engagement, professional empowerment, and lasting ties with Newton School of Technology.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/about"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#064477] shadow-xs transition hover:bg-sky-50"
            >
              Our Mission & Objectives
            </Link>
            <Link
              to="/contact"
              className="rounded-xl border border-sky-300/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact the Executive Cell
            </Link>
          </div>
        </div>
      </section>

      {/* Overview & Charter */}
      <Section id="charter" title="Our Mandate and Structure">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              Established as an official liaison body, the NST Alumni Association serves as the bridge between alumni dispersed worldwide and our academic programs.
            </p>
            <p>
              The Association coordinates closely with institute leadership and faculty advisors to cultivate active student mentorship, collaborative hackathons, and global chapter meetups.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 shadow-xs">
            <h2 className="text-xl font-bold text-[#172B45]">Association Highlights</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0878D1]">✓</span>
                <span>Representing computer science, AI, and engineering cohorts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0878D1]">✓</span>
                <span>Regional chapters across major technology hubs and remote cohorts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0878D1]">✓</span>
                <span>Active engagement with industry placement and internship cells.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0878D1]">✓</span>
                <span>Transparent governance and annual general body meetings.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Core Activities */}
      <div className="bg-[#F7F9FC]">
        <Section id="activities" title="Our Core Activities & Initiatives">
          <p className="mb-10 max-w-2xl leading-relaxed text-slate-600">
            From cohort meetups and tech masterclasses to institutional giving, our ongoing initiatives keep the spirit of innovation thriving.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {activities.map((act) => (
              <article key={act.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <span className="self-start rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
                  {act.tag}
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#172B45]">{act.title}</h3>
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
            <div key={tier.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-xl font-bold text-[#172B45]">{tier.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{tier.benefit}</p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  to={tier.link}
                  className="inline-block text-sm font-semibold text-[#0878D1] hover:underline"
                >
                  {tier.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <section className="border-t border-slate-200 bg-[#064477] py-16 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold">Stay Engaged With Newton School of Technology</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sky-100">
            Whether you graduated recently or in earlier cohorts, your engineering insights and career journey matter to our community. Connect with the alumni association today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#064477] shadow-xs transition hover:bg-sky-50"
            >
              Get in Touch With Us
            </Link>
            <Link
              to="/about"
              className="rounded-xl border border-sky-300/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Read About Our Mission
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
