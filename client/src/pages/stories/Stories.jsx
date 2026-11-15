import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import { SAMPLE_STORIES } from '../../data/sampleStories'

const CATEGORIES = [
  'All Stories',
  'Technology & Engineering',
  'Entrepreneurship & Startups',
  'Leadership & Management',
  'Research & Academia',
  'Professional Growth',
  'Social Impact'
]

export default function Stories() {
  const { session } = useAuth()
  const [stories, setStories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All Stories')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSampleModal, setActiveSampleModal] = useState(null)

  const fetchStories = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '9' })
    if (search.trim()) params.set('search', search.trim())

    apiRequest(`/success-stories?${params}`)
      .then((result) => {
        setStories(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => {
        setError(err.message || 'Unable to load stories at this time.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchStories()
  }, [page, search])

  // Determine if using demo placeholder stories
  // Rules:
  // - If error: Show error state with retry (never silently replace with demo data)
  // - If real published stories exist: Show real stories
  // - If API returns empty array and no search query active: Show demo stories
  const isUsingDemo = !loading && !error && stories.length === 0 && !search.trim()

  // Stories to display based on category filter
  const displayedStories = isUsingDemo ? SAMPLE_STORIES : stories

  const filteredStories = displayedStories.filter((story) => {
    if (selectedCategory === 'All Stories') return true
    const kw = selectedCategory.split(' ')[0].toLowerCase()
    const titleMatch = story.title && story.title.toLowerCase().includes(kw)
    const contentMatch = story.content && story.content.toLowerCase().includes(kw)
    const categoryMatch = story.category && story.category.toLowerCase().includes(kw)
    const summaryMatch = story.summary && story.summary.toLowerCase().includes(kw)
    return titleMatch || contentMatch || categoryMatch || summaryMatch
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            Alumni Journeys
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
            Success Stories & Spotlights
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Inspiring professional pathways, startup ventures, and breakthrough achievements from our alumni community.
          </p>
        </div>
        <div>
          {session?.role === 'ALUMNI' ? (
            <Link
              to="/stories/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0878D1] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2]"
            >
              <span>+ Share Your Story</span>
            </Link>
          ) : (
            <Link
              to="/stories/new"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0878D1] bg-[#EAF2FF] px-4 py-2.5 text-xs font-semibold text-[#0878D1] transition hover:bg-sky-100"
            >
              <span>Alumni? Share Your Story →</span>
            </Link>
          )}
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="mt-8 space-y-4">
        {/* Search input */}
        <div className="max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search stories by keyword, company, topic…"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#0878D1] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div role="status" className="mt-16 text-center text-sm text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0878D1] border-r-transparent align-[-0.125em]" />
          <p className="mt-3 font-medium text-slate-600">Loading stories…</p>
        </div>
      )}

      {/* Error state with Retry */}
      {!loading && error && (
        <div role="alert" className="mt-12 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="font-semibold">Unable to load success stories</p>
          </div>
          <p className="mt-2 text-rose-700">{error}</p>
          <button
            type="button"
            onClick={fetchStories}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!loading && !error && (
        <>
          {/* Demo stories disclaimer banner */}
          {isUsingDemo && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 text-amber-900 shadow-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl">💡</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        DEMO STORIES
                      </span>
                      <h3 className="text-sm font-bold text-amber-900">
                        Illustrative Alumni Profiles
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
                      No verified alumni stories have been published yet. The profiles below represent sample career trajectories to showcase what you can share.
                    </p>
                  </div>
                </div>
                <Link
                  to="/stories/new"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0878D1] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0665B2]"
                >
                  Be the First to Share →
                </Link>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {filteredStories.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story) => {
                // If it's a demo placeholder story
                if (story.isDemo || story.isSample) {
                  return (
                    <article
                      key={story.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                    >
                      <div className="flex flex-col h-full">
                        {/* Card Image / Avatar header */}
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

                          {/* DEMO STORY Label */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-xs shadow-xs">
                            <span>DEMO STORY</span>
                          </div>

                          {/* Graduation Year */}
                          <div className="absolute top-3 right-3 rounded-md bg-slate-900/75 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                            Class of {story.graduationYear}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="flex flex-1 flex-col p-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">
                              {story.authorName}
                            </h3>
                            <p className="text-xs font-semibold text-[#0878D1]">
                              {story.designation}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {story.company}
                            </p>
                            {story.department && (
                              <p className="mt-1 text-[11px] text-slate-400">
                                {story.department}
                              </p>
                            )}
                          </div>

                          <h4 className="mt-3 text-sm font-bold text-[#172B45] leading-snug line-clamp-2">
                            {story.title}
                          </h4>

                          <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {story.summary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 px-6 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setActiveSampleModal(story)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline cursor-pointer"
                        >
                          View Demo Story →
                        </button>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Placeholder
                        </span>
                      </div>
                    </article>
                  )
                }

                // If it's a real published story
                const authorName = story.author?.fullName || story.authorName || 'Alumni Member'
                const authorYear = story.author?.graduationYear
                  ? `Class of ${story.author.graduationYear}`
                  : null
                const authorDept = story.author?.department

                return (
                  <article
                    key={story.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                  >
                    <div>
                      {story.imageUrl ? (
                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
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
                        {authorDept && (
                          <p className="mt-1 text-[11px] text-slate-400">{authorDept}</p>
                        )}
                        <h2 className="mt-3 text-lg font-bold text-[#172B45] leading-snug line-clamp-2">
                          {story.title}
                        </h2>
                        <p className="mt-2 line-clamp-3 text-sm text-slate-600 leading-relaxed">
                          {story.content}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 p-6 pt-3">
                      <Link
                        to={`/stories/${story.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0878D1] hover:underline"
                      >
                        Read Full Story →
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-3xl text-[#0878D1]">
                🔍
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#172B45]">
                No matching stories found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
                We couldn&apos;t find any stories matching &ldquo;{search || selectedCategory}&rdquo;. Try adjusting your search keyword or selected category.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory('All Stories')
                    setPage(1)
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Bottom Community CTA Card */}
          <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#172B45] to-[#0A1A2F] p-8 sm:p-12 text-white shadow-md">
            <div className="max-w-3xl">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-300 backdrop-blur-xs">
                Your Story Matters
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                Inspire the Next Generation of Alumni & Students
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Whether you launched a venture, broke ground in research, advanced your career, or drove meaningful social impact — your journey can guide and empower thousands in our alumni network.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  to="/stories/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0878D1] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2]"
                >
                  <span>Share Your Success Story</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/directory"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
                >
                  <span>Explore Alumni Directory</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Pagination (Only for real stories) */}
          {!isUsingDemo && pages > 1 && (
            <nav aria-label="Story pages" className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}

      {/* Demo Story Modal Dialog */}
      {activeSampleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sample-modal-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveSampleModal(null)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
              aria-label="Close dialog"
            >
              ✕
            </button>

            {/* DEMO STORY pill */}
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                DEMO STORY
              </span>
              <span className="text-xs font-medium text-slate-500">
                Fictional Alumni Persona
              </span>
            </div>

            {/* Title */}
            <h2 id="sample-modal-title" className="mt-3 text-2xl font-extrabold text-[#172B45] leading-snug">
              {activeSampleModal.title}
            </h2>

            {/* Author Profile Card */}
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

            {/* Full Story Content */}
            <div className="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-medium text-slate-900 italic bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                &ldquo;{activeSampleModal.summary}&rdquo;
              </p>
              <p>{activeSampleModal.fullStory}</p>
            </div>

            {/* Disclaimer & Action */}
            <div className="mt-8 border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-500">
                This is a demo story created to illustrate alumni achievements on the platform.
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
                  to="/stories/new"
                  className="rounded-xl bg-[#0878D1] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
                >
                  Share Your Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
