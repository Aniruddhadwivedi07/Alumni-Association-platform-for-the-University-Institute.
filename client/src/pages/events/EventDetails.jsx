import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function EventDetails() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/events/${eventId}`).then((result) => setEvent(result.data)).catch((err) => setError(err.message))
  }, [eventId])

  if (error) return <p role="alert" className="mx-auto max-w-3xl px-6 py-12 text-red-700">{error}</p>
  if (!event) return <p className="mx-auto max-w-3xl px-6 py-12">Loading event…</p>

  return <article className="mx-auto max-w-3xl px-6 py-12">
    <Link to="/events" className="text-indigo-700">← All events</Link>
    <h1 className="mt-6 text-3xl font-bold">{event.title}</h1>
    <p className="mt-4">Starts: {new Date(event.startDate).toLocaleString()}</p>
    <p>Ends: {new Date(event.endDate).toLocaleString()}</p>
    <p>Location: {event.location || 'To be announced'}</p>
    {event.capacity && <p>Capacity: {event.capacity}</p>}
    {event.registrationDeadline && <p>Register by: {new Date(event.registrationDeadline).toLocaleString()}</p>}
    <p className="mt-8 whitespace-pre-wrap leading-relaxed">{event.description}</p>
  </article>
}
