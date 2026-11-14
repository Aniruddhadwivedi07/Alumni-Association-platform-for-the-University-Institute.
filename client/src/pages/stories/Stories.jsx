import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

export default function Stories() {
  const { session } = useAuth()
  const [stories, setStories] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/success-stories?page=${page}`)
      .then((result) => {
        setStories(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            NST Alumni Impact
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
            Alumni Success Stories
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Discover engineering milestones, startup launches, and career achievements from Newton School of Technology graduates.
          </p>
        </div>
        {session?.role === 'ALUMNI' && (
          <Link
            to="/stories/new"
            className="rounded-xl bg-[#0878D1] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2]"
          >
            Share Your Story
          </Link>
        )}
      </div>

      {loading && (
        <p role="status" className="mt-10 text-center text-sm text-slate-500">
          Loading success stories…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article
              key={story.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
            >
              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt=""
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-6">
                <span className="inline-block rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-xs font-medium text-[#0878D1]">
                  By {story.authorName}
                </span>
                <h2 className="mt-3 text-lg font-bold text-[#172B45]">{story.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600 leading-relaxed">
                  {story.content}
                </p>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <Link
                    to={`/stories/${story.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline"
                  >
                    Read Full Story →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && !stories.length && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F7F9FC] p-10 text-center text-slate-600">
          <p className="text-base font-semibold text-slate-800">No published success stories yet.</p>
          <p className="mt-1 text-sm text-slate-500">Alumni can submit their journey to be featured on the platform.</p>
        </div>
      )}

      <nav aria-label="Story pages" className="mt-10 flex items-center justify-center gap-4">
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
    </section>
  )
}
