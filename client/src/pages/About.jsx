import { Link } from 'react-router-dom'
import Section from '../components/Section'

export default function About() {
  const objectives = [
    {
      title: 'Strengthen Lifelong Bonds',
      description: 'Foster active relationships among graduates across all academic batches, cohorts, and technological disciplines.',
    },
    {
      title: 'Guide Future Generations',
      description: 'Connect experienced NST alumni with current students through purposeful mentorship, portfolio reviews, and career navigation.',
    },
    {
      title: 'Advance Institutional Excellence',
      description: 'Collaborate with Newton School of Technology leadership to support campus tech labs, academic hackathons, and curriculum innovation.',
    },
    {
      title: 'Celebrate Impact & Heritage',
      description: 'Recognize alumni accomplishments across the global tech landscape and preserve the vibrant heritage and traditions of our institution.',
    },
  ]

  const pillars = [
    {
      role: 'Alumni',
      highlight: 'Give Back & Network',
      details: 'Reconnect with cohort peers, discover collaborative tech ventures, post job openings, and share knowledge with ambitious students.',
    },
    {
      role: 'Students',
      highlight: 'Learn & Propel',
      details: 'Gain direct access to industry engineers, seek mentorship on algorithms and system design, and learn from seniors who walked the same campus.',
    },
    {
      role: 'Faculty & Institute',
      highlight: 'Partner & Innovate',
      details: 'Keep project-first curricula aligned with industry evolution, facilitate tech masterclasses, and drive joint engineering initiatives.',
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
            About NST Alumni Association
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-sky-100">
            A united community dedicated to celebrating our shared journey, supporting current students, and championing the future of Newton School of Technology.
          </p>
        </div>
      </section>

      {/* Mission & Purpose */}
      <Section id="purpose" title="Our Purpose & Mission">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              The Newton School of Technology Alumni Association is the official organization connecting graduates around the globe with our institution, current students, and faculty.
            </p>
            <p>
              Our mission is to establish a vibrant, mutually supportive engineering community where knowledge, career opportunities, and institutional pride flow freely between generations of technologists and leaders.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-[#EAF2FF]/60 p-8">
            <h2 className="text-xl font-bold text-[#064477]">Our Vision</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              To be an inspiring global network of technology leaders and innovators whose collective contributions drive transformative learning, professional advancement, and societal progress.
            </p>
            <div className="mt-6 border-t border-sky-200/60 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">Values: </span>
              <span className="text-sm font-medium text-slate-700">Engineering Excellence • Integrity • Mutual Growth • Community</span>
            </div>
          </div>
        </div>
      </Section>

      {/* The 3-way connection: Alumni, Students, Faculty */}
      <div className="bg-[#F7F9FC]">
        <Section id="nexus" title="Connecting Alumni, Students, and Faculty">
          <p className="mb-10 max-w-2xl leading-relaxed text-slate-600">
            True institutional growth happens when experienced graduates, enthusiastic students, and committed faculty work together toward a shared vision.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.role} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">{pillar.role}</span>
                <h3 className="mt-2 text-xl font-bold text-[#172B45]">{pillar.highlight}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{pillar.details}</p>
              </article>
            ))}
          </div>
        </Section>
      </div>

      {/* Key Objectives */}
      <Section id="objectives" title="Key Objectives & Association Benefits">
        <div className="grid gap-6 sm:grid-cols-2">
          {objectives.map((obj) => (
            <div key={obj.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#172B45]">{obj.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{obj.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-[#172B45]">Join Your Alumni Network Today</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Whether you want to explore the association charter, contact our coordinators, or get involved in upcoming initiatives, there is a place for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/alumni-association"
              className="rounded-xl bg-[#0878D1] px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2]"
            >
              Explore Association Activities
            </Link>
            <Link
              to="/contact"
              className="rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Contact Association Cell
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
