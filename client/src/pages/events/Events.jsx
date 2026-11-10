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
      .then((result) => { setEvents(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
      .catch((err) => setError(err.message))
  }, [search, page])

  return <section className="mx-auto max-w-6xl px-6 py-12">
    <h1 className="text-3xl font-bold">Upcoming events</h1>
    <p className="mt-2 text-slate-600">Meet alumni at reunions, workshops, and college events.</p>
    <label className="mt-8 block max-w-md text-sm font-semibold">Search events
      <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="mt-2 w-full rounded border p-3" placeholder="Event or location" />
    </label>
    {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}
    {!error && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => <article key={event.id} className="rounded-xl border bg-white p-6">
        <p className="text-sm text-indigo-700">{new Date(event.startDate).toLocaleString()}</p>
        <h2 className="mt-2 text-xl font-bold">{event.title}</h2>
        <p className="mt-2 text-slate-600">{event.location || 'Location to be announced'}</p>
        <p className="mt-3 line-clamp-3">{event.description}</p>
        <Link to={`/events/${event.id}`} className="mt-4 inline-block font-semibold text-indigo-700">View details</Link>
      </article>)}
    </div>}
    {!error && events.length === 0 && <p className="mt-6">No upcoming events found.</p>}
    <nav aria-label="Event pages" className="mt-8 flex justify-center gap-4">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </nav>
  </section>
}
