import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function MyEventRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/events/my-registrations?page=${page}&limit=10`)
      .then((result) => { setRegistrations(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
      .catch((err) => setError(err.message))
  }, [page])

  async function cancel(item) {
    try {
      await apiRequest(`/events/${item.eventId}/register`, { method: 'DELETE' })
      setRegistrations(registrations.map((registration) => registration.id === item.id ? { ...registration, status: 'CANCELLED' } : registration))
    } catch (err) { setError(err.message) }
  }

  return <section className="mx-auto max-w-4xl px-6 py-12">
    <h1 className="text-3xl font-bold">My event registrations</h1>
    {error && <p role="alert" className="mt-5 text-red-700">{error}</p>}
    <div className="mt-8 space-y-4">
      {registrations.map((item) => <article key={item.id} className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-bold">{item.event?.title || 'Event'}</h2>
        <p className="mt-2">{item.event?.startDate && new Date(item.event.startDate).toLocaleString()}</p>
        <p className="mt-2">Status: {item.status}</p>
        <div className="mt-4 flex gap-4">
          <Link to={`/events/${item.eventId}`} className="text-indigo-700">View event</Link>
          {item.status === 'REGISTERED' && <button onClick={() => cancel(item)} className="text-red-700">Cancel registration</button>}
        </div>
      </article>)}
      {!registrations.length && !error && <p>No event registrations yet.</p>}
    </div>
    <nav aria-label="Registration pages" className="mt-8 flex gap-4">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </nav>
  </section>
}
