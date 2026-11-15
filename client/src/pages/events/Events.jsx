import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { DEMO_EVENTS } from '../../data/demoEvents'

export default function Events() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDemoEvent, setSelectedDemoEvent] = useState(null)

  const fetchEvents = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '9', upcoming: 'true' })
    if (search.trim()) params.set('search', search.trim())

    apiRequest(`/events?${params}`)
      .then((result) => {
        setEvents(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => {
        setError(err.message || 'Unable to load events at this time.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents()
    }, 250)
    return () => clearTimeout(timer)
  }, [search, page])

  const hasActiveFilter = Boolean(search.trim())

  // Determine if using demo events:
  // ONLY when request succeeded (!error && !loading) and database has 0 records, without active search filter.
  const isUsingDemo = !loading && !error && events.length === 0 && !hasActiveFilter

  const displayedEvents = isUsingDemo
    ? DEMO_EVENTS
    : events

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            Campus & Community Gatherings
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
            Alumni Events & Reunions
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Meet fellow alumni at annual reunions, technical workshops, global summits, and chapter meetups.
          </p>
        </div>
        <div className="text-right">
          {isUsingDemo ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-bold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Demo Showcase ({DEMO_EVENTS.length} Events)
            </span>
          ) : (
            <Link
              to="/my-events"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              My Event Registrations →
            </Link>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="max-w-md space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Search Upcoming Events
          </label>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by event title, keyword, or venue…"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </div>
        {hasActiveFilter && (
          <div className="mt-3 flex justify-start text-xs">
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              className="font-semibold text-[#0878D1] hover:underline"
            >
              Clear search ✕
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div role="status" className="mt-12 text-center text-sm text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0878D1] border-r-transparent align-[-0.125em]" />
          <p className="mt-3 font-medium text-slate-600">Loading events…</p>
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && error && (
        <div role="alert" className="mt-12 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="font-semibold">Unable to load upcoming events</p>
          </div>
          <p className="mt-2 text-rose-700">{error}</p>
          <button
            type="button"
            onClick={fetchEvents}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Demo Notice Banner */}
          {isUsingDemo && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 text-amber-900 shadow-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl">📅</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Demo Events
                      </span>
                      <h3 className="text-sm font-bold text-amber-900">
                        Sample Events & Conclaves Showcase
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
                      No live events have been published by campus administrators yet. Below is an illustrative schedule showcasing alumni reunions, summits, and workshops.
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-200/80 px-3.5 py-1.5 text-xs font-semibold text-amber-900">
                  Registrations Disabled for Demo
                </span>
              </div>
            </div>
          )}

          {/* Events Grid */}
          {displayedEvents.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedEvents.map((event) => {
                if (event.isDemo) {
                  const eventDateStr = new Date(event.startDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                  const eventTimeStr = new Date(event.startDate).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })

                  return (
                    <article
                      key={event.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                    >
                      <div>
                        {/* Cover Image */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-sky-100 to-indigo-100 text-3xl">
                              🗓️
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-xs shadow-xs">
                            DEMO EVENT
                          </div>
                          <div className="absolute top-3 right-3 rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs uppercase">
                            {event.category}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-6">
                          <p className="text-xs font-bold text-[#0878D1]">
                            🗓️ {eventDateStr} • {eventTimeStr}
                          </p>
                          <h2 className="mt-2 text-lg font-bold text-[#172B45] group-hover:text-[#0878D1] transition line-clamp-2">
                            {event.title}
                          </h2>
                          <p className="mt-1 text-xs text-slate-500 font-medium line-clamp-1">
                            📍 {event.location}
                          </p>
                          <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {event.description}
                          </p>

                          {event.highlights && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {event.highlights.slice(0, 2).map((item) => (
                                <span
                                  key={item}
                                  className="rounded bg-sky-50 text-[#0878D1] border border-sky-100 px-2 py-0.5 text-[10px] font-medium"
                                >
                                  ✨ {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 px-6 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedDemoEvent(event)}
                          className="text-xs font-semibold text-[#0878D1] hover:underline cursor-pointer"
                        >
                          View Event Overview →
                        </button>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Demo Preview
                        </span>
                      </div>
                    </article>
                  )
                }

                // Real database event
                return (
                  <article
                    key={event.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0878D1]">
                        {new Date(event.startDate).toLocaleString()}
                      </p>
                      <h2 className="mt-2 text-lg font-bold text-[#172B45] group-hover:text-[#0878D1] transition line-clamp-2">
                        {event.title}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        📍 {event.location || 'Location to be announced'}
                      </p>
                      <p className="mt-3 line-clamp-3 text-xs text-slate-600 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <Link
                        to={`/events/${event.id}`}
                        className="inline-block text-xs font-semibold text-[#0878D1] hover:underline"
                      >
                        View Full Details →
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
                No upcoming events found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
                We couldn&apos;t find any events matching your search criteria. Try using different keywords.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Pagination (Only for real events) */}
          {!isUsingDemo && pages > 1 && (
            <nav aria-label="Event pages" className="mt-12 flex items-center justify-center gap-4">
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

      {/* Demo Event Details Modal */}
      {selectedDemoEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedDemoEvent(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                    DEMO EVENT
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                    {selectedDemoEvent.category}
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-[#172B45] leading-snug">
                  {selectedDemoEvent.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemoEvent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {selectedDemoEvent.coverImage && (
              <div className="mt-4 overflow-hidden rounded-2xl h-52 w-full bg-slate-100">
                <img
                  src={selectedDemoEvent.coverImage}
                  alt={selectedDemoEvent.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-6 space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                🗓️ Starts: {new Date(selectedDemoEvent.startDate).toLocaleString()}
              </p>
              <p className="font-semibold text-slate-800">
                🏁 Ends: {new Date(selectedDemoEvent.endDate).toLocaleString()}
              </p>
              <p className="font-semibold text-slate-800">
                📍 Location: {selectedDemoEvent.location}
              </p>
              {selectedDemoEvent.capacity && (
                <p>Capacity: {selectedDemoEvent.capacity} Attendees ({selectedDemoEvent.registeredCount} pre-registered)</p>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                About this Event
              </h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedDemoEvent.description}
              </p>
            </div>

            {selectedDemoEvent.highlights && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Key Schedule Highlights
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                  {selectedDemoEvent.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2">
                      <span className="text-[#0878D1]">✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold">Demo Event Only</p>
                <p className="mt-0.5 text-amber-800">
                  Registrations are disabled for demo events. Published events by the Alumni Council allow instant online registration and badge generation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemoEvent(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
