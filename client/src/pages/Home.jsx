import { Link } from 'react-router-dom'
import Section from '../components/Section'

const features = [
  { title: 'Alumni connections', text: 'Reconnect with classmates and build professional relationships across graduating batches.' },
  { title: 'Mentorship and careers', text: 'Share your experience, guide students, and discover opportunities within the community.' },
  { title: 'Events and reunions', text: 'Stay connected through campus gatherings, alumni reunions, and community events.' },
  { title: 'Give back', text: 'Support student growth and take part in initiatives that strengthen our institution.' },
]

export default function Home() {
  return (
    <>
      <section className="bg-indigo-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">Government Engineering College</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Your campus years end.<br />Your connections grow.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-indigo-100">A community for alumni and students to reconnect, share knowledge, and build what comes next together.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#features" className="rounded-lg bg-white px-5 py-3 font-semibold text-indigo-950 hover:bg-indigo-50">Explore our community</a>
              <Link to="/about" className="rounded-lg border border-indigo-300 px-5 py-3 font-semibold hover:bg-indigo-900">About the association</Link>
            </div>
          </div>
          <aside aria-label="Our community" className="rounded-2xl border border-indigo-700 bg-indigo-900 p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">One institution. Lifelong belonging.</p>
            <ul className="mt-8 space-y-6">
              <li><h2 className="text-xl font-bold">Reconnect</h2><p className="mt-2 text-indigo-100">Find familiar faces and make new connections.</p></li>
              <li><h2 className="text-xl font-bold">Inspire</h2><p className="mt-2 text-indigo-100">Turn your experience into someone else's next step.</p></li>
              <li><h2 className="text-xl font-bold">Contribute</h2><p className="mt-2 text-indigo-100">Help our college community move forward.</p></li>
            </ul>
          </aside>
        </div>
      </section>
      <Section id="introduction" title="Connected by our roots. United by possibility.">
        <p className="max-w-3xl text-lg leading-relaxed text-slate-600">The Alumni Association brings graduates, current students, and the institution closer together. Whether you want to share a lesson, reconnect with your batch, or support the next generation, you belong here.</p>
      </Section>
      <div className="bg-white">
        <Section id="features" title="A community that grows with you">
          <p className="mb-8 max-w-2xl leading-relaxed text-slate-600">Discover the ways our association connects people and supports our shared future.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-xl font-bold text-indigo-950">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </Section>
      </div>
      <Section id="community" title="Keep your connection to campus alive">
        <p className="max-w-2xl leading-relaxed text-slate-600">Learn about the association and the shared purpose that brings our community together.</p>
        <Link to="/about" className="mt-6 inline-block rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800">Get to know us</Link>
      </Section>
    </>
  )
}
