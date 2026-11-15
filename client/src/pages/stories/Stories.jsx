import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

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

  useEffect(() => {
    let isMounted = true
    const params = new URLSearchParams({ page: String(page), limit: '9' })
    if (search.trim()) params.set('search', search.trim())

    apiRequest(`/success-stories?${params}`)
      .then((result) => {
        if (!isMounted) return
        setStories(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [page, search])

  // Client-side category matching if story content or title includes the category keyword
  const filteredStories = stories.filter((story) => {
    if (selectedCategory === 'All Stories') return true
    const kw = selectedCategory.split(' ')[0].toLowerCase()
    return (
      (story.title && story.title.toLowerCase().includes(kw)) ||
      (story.content && story.content.toLowerCase().includes(kw))
    )
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

      {/* Loading */}
      {loading && (
        <p role="status" className="mt-12 text-center text-sm text-slate-500">
          Loading alumni success stories…
        </p>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {/* Stories Listing */}
      {!loading && !error && (
        <>
          {filteredStories.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story) => {
                const authorName = story.author?.fullName || story.authorName || 'Alumni Member'
                const authorYear = story.author?.graduationYear
                  ? `Class of ${story.author.graduationYear}`
                  : null
                const authorDept = story.author?.department

                return (
                  <article
                    key={story.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      {story.imageUrl ? (
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="h-48 w-full object-cover"
                        />
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
            /* PS Mandated Empty State */
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-3xl text-[#0878D1]">
                ✍️
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#172B45]">
                Every Journey Has a Story.
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 leading-relaxed">
                Share your professional journey, achievements and experiences with the alumni community. Your story could inspire someone else's next step.
              </p>
              <div className="mt-6">
                <Link
                  to="/stories/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0878D1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
                >
                  Share Your Story
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
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
    </section>
  )
}
