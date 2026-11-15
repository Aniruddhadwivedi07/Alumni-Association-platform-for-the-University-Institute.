import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '../components/Section'
import { SAMPLE_STORIES } from '../data/sampleStories'
import { apiRequest } from '../lib/api'

const features = [
  { title: 'Alumni connections', text: 'Reconnect with classmates and build professional relationships across graduating batches.' },
  { title: 'Mentorship and careers', text: 'Share your experience, guide students, and discover opportunities within the community.' },
  { title: 'Events and reunions', text: 'Stay connected through campus gatherings, alumni reunions, and community events.' },
  { title: 'Give back', text: 'Support student growth and take part in initiatives that strengthen our institution.' },
]

export default function Home() {
  const [stories, setStories] = useState([])
  const [activeSampleModal, setActiveSampleModal] = useState(null)

  useEffect(() => {
    let isMounted = true
    apiRequest('/success-stories?page=1&limit=3')
      .then((res) => {
        if (!isMounted) return
        setStories(res.data || [])
      })
      .catch(() => {
        // Fallback gracefully without breaking homepage
      })
    return () => {
      isMounted = false
    }
  }, [])

  // If real stories exist, take top 3; otherwise always show sample stories (top 3)
  const isUsingSample = stories.length === 0
  const displayedStories = isUsingSample ? SAMPLE_STORIES.slice(0, 3) : stories.slice(0, 3)

  return (
    <>
      <section className="bg-indigo-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:items-center md:gap-12 md:py-24">
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

      {/* Featured Success Stories Section */}
      <section id="stories" className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
                Success Stories & Spotlights
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">
                Alumni Journeys & Breakthroughs
              </h2>
              <p className="mt-2 max-w-2xl text-base text-slate-600">
                Inspiring career pathways, ventures, and breakthroughs from our alumni network.
              </p>
            </div>
            <div>
              <Link
                to="/stories"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0878D1] hover:underline"
              >
                <span>View All Stories</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedStories.map((story) => {
              if (story.isSample) {
                return (
                  <article
                    key={story.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        {story.avatar ? (
                          <img
                            src={story.avatar}
                            alt={story.authorName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: story.avatar ? 'none' : 'flex' }}
                          className="h-full w-full items-center justify-center bg-gradient-to-br from-[#0878D1]/10 to-sky-100 text-3xl font-bold text-[#0878D1]"
                        >
                          {story.avatarInitials || 'AL'}
                        </div>

                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-xs shadow-xs">
                          SAMPLE
                        </div>

                        <div className="absolute top-3 right-3 rounded-md bg-slate-900/75 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                          Class of {story.graduationYear}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-base font-bold text-slate-900">
                          {story.authorName}
                        </h3>
                        <p className="text-xs font-semibold text-[#0878D1]">
                          {story.designation} • {story.company}
                        </p>

                        <h4 className="mt-3 text-sm font-bold text-[#172B45] leading-snug line-clamp-2">
                          {story.title}
                        </h4>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {story.summary}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 px-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveSampleModal(story)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline cursor-pointer"
                      >
                        View Sample Profile →
                      </button>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        Placeholder
                      </span>
                    </div>
                  </article>
                )
              }

              const authorName = story.author?.fullName || story.authorName || 'Alumni Member'
              const authorYear = story.author?.graduationYear
                ? `Class of ${story.author.graduationYear}`
                : null

              return (
                <article
                  key={story.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                >
                  <div>
                    {story.imageUrl ? (
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center bg-gradient-to-r from-slate-100 to-sky-50 text-3xl">
                        ✨
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-[#0878D1]">
                          By {authorName}
                        </span>
                        {authorYear && <span>{authorYear}</span>}
                      </div>
                      <h3 className="mt-3 text-base font-bold text-[#172B45] leading-snug line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-xs text-slate-600 leading-relaxed">
                        {story.content}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 p-4 px-6">
                    <Link
                      to={`/stories/${story.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline"
                    >
                      Read Full Story →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {/* CTA under the stories */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-indigo-900 p-6 text-white shadow-xs">
            <div>
              <h3 className="text-base font-bold">Have an inspiring story from your career?</h3>
              <p className="mt-1 text-xs text-indigo-200">
                Share your journey, startup, or research breakthrough with fellow graduates and students.
              </p>
            </div>
            <Link
              to="/stories/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-950 shadow-xs hover:bg-indigo-50 transition"
            >
              Share Your Story →
            </Link>
          </div>
        </div>
      </section>

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

      {/* Sample Story Modal Dialog */}
      {activeSampleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-sample-modal-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveSampleModal(null)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
              aria-label="Close dialog"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                SAMPLE STORY
              </span>
              <span className="text-xs font-medium text-slate-500">
                Fictional Alumni Persona
              </span>
            </div>

            <h2 id="home-sample-modal-title" className="mt-3 text-2xl font-extrabold text-[#172B45] leading-snug">
              {activeSampleModal.title}
            </h2>

            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                {activeSampleModal.avatar ? (
                  <img
                    src={activeSampleModal.avatar}
                    alt={activeSampleModal.authorName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0878D1] font-bold text-white">
                    {activeSampleModal.avatarInitials}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{activeSampleModal.authorName}</h3>
                <p className="text-xs font-semibold text-[#0878D1]">
                  {activeSampleModal.designation} • {activeSampleModal.company}
                </p>
                <p className="text-xs text-slate-500">
                  {activeSampleModal.department} • Class of {activeSampleModal.graduationYear}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-medium text-slate-900 italic bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                &ldquo;{activeSampleModal.summary}&rdquo;
              </p>
              <p>{activeSampleModal.fullStory}</p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-500">
                This is a sample story created to illustrate alumni achievements on the platform.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSampleModal(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <Link
                  to="/stories"
                  className="rounded-xl bg-[#0878D1] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
                >
                  View All Stories
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
