import { Link } from 'react-router-dom'
import Section from '../components/Section'

export default function About() {
  const objectives = [
    {
      title: 'Strengthen Lifelong Bonds',
      description: 'Foster active relationships among graduates across all academic batches, departments, and geographies.',
    },
    {
      title: 'Guide Future Generations',
      description: 'Connect experienced alumni with current students through purposeful mentorship, mock interviews, and career navigation.',
    },
    {
      title: 'Advance Institutional Excellence',
      description: 'Collaborate with college leadership to support campus infrastructure, state-of-the-art research labs, and academic innovation.',
    },
    {
      title: 'Celebrate Impact & Heritage',
      description: 'Recognize alumni accomplishments worldwide and preserve the vibrant heritage and traditions of our institution.',
    },
  ]

  const pillars = [
    {
      role: 'Alumni',
      highlight: 'Give Back & Network',
      details: 'Reconnect with old classmates, discover collaborative ventures, post job openings, and share knowledge with eager students.',
    },
    {
      role: 'Students',
      highlight: 'Learn & Propel',
      details: 'Gain direct access to industry veterans, seek internship guidance, and discover career paths directly from seniors who walked the same campus.',
    },
    {
      role: 'Faculty & Institute',
      highlight: 'Partner & Innovate',
      details: 'Keep curricula aligned with evolving industry trends, facilitate guest lectures, and drive joint research or departmental development.',
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
            About Our Alumni Association
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-indigo-100">
            A united community dedicated to celebrating our shared past, supporting current students, and championing the future of Government Engineering College.
          </p>
        </div>
      </section>

      {/* Mission & Purpose */}
      <Section id="purpose" title="Our Purpose & Mission">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-lg leading-relaxed text-slate-600">
            <p>
              The Government Engineering College Alumni Association is the official organization connecting thousands of graduates around the globe with our alma mater, current students, and faculty.
            </p>
            <p>
              Our mission is to establish a vibrant, mutually supportive community where knowledge, career opportunities, and institutional pride flow freely between generations of engineers and innovators.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-8">
            <h2 className="text-xl font-bold text-indigo-950">Our Vision</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              To be an inspiring global network of leaders and changemakers whose collective contributions drive transformative learning, professional advancement, and societal progress.
            </p>
            <div className="mt-6 border-t border-indigo-200/60 pt-4">
              <span className="text-sm font-semibold text-indigo-900">Founded on: </span>
              <span className="text-sm text-slate-600">Excellence • Integrity • Mutual Growth • Community</span>
            </div>
          </div>
        </div>
      </Section>

      {/* The 3-way connection: Alumni, Students, Faculty */}
      <div className="bg-slate-50">
        <Section id="nexus" title="Connecting Alumni, Students, and Faculty">
          <p className="mb-10 max-w-2xl leading-relaxed text-slate-600">
            True institutional growth happens when experienced graduates, enthusiastic students, and committed faculty work together toward a shared vision.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.role} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">{pillar.role}</span>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{pillar.highlight}</h3>
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
            <div key={obj.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-bold text-indigo-950">{obj.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{obj.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-indigo-950">Join Your Alumni Network Today</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Whether you want to explore the association charter, contact our coordinators, or get involved in upcoming initiatives, there is a place for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/alumni-association"
              className="rounded-lg bg-indigo-700 px-6 py-3 font-semibold text-white transition hover:bg-indigo-800"
            >
              Explore Association Activities
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Contact Association Cell
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
