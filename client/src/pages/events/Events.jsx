import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function Events() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '9', upcoming: 'true' })
    if (search.trim()) params.set('search', search.trim())
    apiRequest(`/events?${params}`)
      .then((result) => {
        setEvents(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => setError(err.message))
  }, [search, page])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
        NST Gatherings & Reunions
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
        Upcoming Events
      </h1>
      <p className="mt-2 text-base text-slate-600">
        Connect with Newton School of Technology alumni and faculty at tech workshops, cohort reunions, and regional meetups.
      </p>

      {/* Search Bar */}
      <div className="mt-8 max-w-md">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Search Events
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            placeholder="Event title, topics, or location"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {!error && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md"
            >
              <div>
                <span className="inline-block rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-xs font-semibold text-[#0878D1]">
                  📅 {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <h2 className="mt-3 text-lg font-bold text-[#172B45]">{event.title}</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  📍 {event.location || 'NST Campus / Virtual'}
                </p>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600 leading-relaxed">
                  {event.description}
                </p>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline"
                >
                  View Details & Register →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!error && events.length === 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F7F9FC] p-10 text-center text-slate-600">
          <p className="text-base font-semibold text-slate-800">No upcoming events scheduled right now.</p>
          <p className="mt-1 text-sm text-slate-500">Check back soon for new hackathons, reunions, and webinars.</p>
        </div>
      )}

      <nav aria-label="Event pages" className="mt-10 flex items-center justify-center gap-4">
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
