import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function Mentorship() {
  const { session } = useAuth()
  const [mentors, setMentors] = useState([])
  const [mentorId, setMentorId] = useState('')
  const [message, setMessage] = useState('')
  const [requests, setRequests] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  const isStudent = session?.role === 'STUDENT'

  useEffect(() => {
    if (!isStudent) return
    apiRequest('/directory/alumni?page=1&limit=50')
      .then((result) => setMentors(result.data || []))
      .catch((err) => setError(err.message))
  }, [isStudent])

  useEffect(() => {
    const side = isStudent ? 'sent' : 'received'
    apiRequest(`/mentorship/requests/${side}?page=${page}&limit=10`)
      .then((result) => { setRequests(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
      .catch((err) => setError(err.message))
  }, [isStudent, page, reload])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      await apiRequest('/mentorship/requests', { method: 'POST', body: JSON.stringify({ mentorId: Number(mentorId), message }) })
      setNotice('Request sent.')
      setMentorId('')
      setMessage('')
      setPage(1)
      setReload(reload + 1)
    } catch (err) { setError(err.message) }
  }

  async function changeRequest(id, method, status) {
    try {
      await apiRequest(`/mentorship/requests/${id}${method === 'PATCH' ? '/status' : ''}`, {
        method, ...(status ? { body: JSON.stringify({ status }) } : {}),
      })
      setReload(reload + 1)
    } catch (err) { setError(err.message) }
  }

  return <section className="mx-auto max-w-4xl px-6 py-12">
    <h1 className="text-3xl font-bold">Mentorship</h1>
    {isStudent && <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border bg-white p-6">
      <h2 className="text-xl font-bold">Ask an alumnus for mentorship</h2>
      <label className="block text-sm font-semibold">Choose a mentor
        <select required value={mentorId} onChange={(event) => setMentorId(event.target.value)} className="mt-2 w-full rounded border p-3">
          <option value="">Select an alumnus</option>
          {mentors.map((person) => <option key={person.userId} value={person.userId}>{person.fullName} — {person.currentJobTitle || person.department || 'Alumnus'}</option>)}
        </select>
      </label>
      <label className="block text-sm font-semibold">Message
        <textarea maxLength="1000" rows="4" value={message} onChange={(event) => setMessage(event.target.value)} className="mt-2 w-full rounded border p-3" />
      </label>
      <button className="rounded bg-indigo-700 px-5 py-3 text-white">Send request</button>
    </form>}
    {notice && <p role="status" className="mt-5 text-green-700">{notice}</p>}
    {error && <p role="alert" className="mt-5 text-red-700">{error}</p>}
    <h2 className="mt-10 text-2xl font-bold">{isStudent ? 'Requests sent' : 'Requests received'}</h2>
    <div className="mt-5 space-y-4">
      {requests.map((item) => <article key={item.id} className="rounded-xl border bg-white p-5">
        <h3 className="font-bold">{isStudent ? item.mentor?.fullName || `Mentor #${item.mentorId}` : item.student?.fullName || `Student #${item.studentId}`}</h3>
        {item.message && <p className="mt-2 whitespace-pre-wrap">{item.message}</p>}
        <p className="mt-2">Status: <strong>{item.status}</strong></p>
        <div className="mt-3 flex gap-4">
          {isStudent && item.status === 'PENDING' && <button onClick={() => changeRequest(item.id, 'DELETE')} className="text-red-700">Withdraw</button>}
          {!isStudent && item.status === 'PENDING' && <><button onClick={() => changeRequest(item.id, 'PATCH', 'ACCEPTED')} className="text-green-700">Accept</button><button onClick={() => changeRequest(item.id, 'PATCH', 'REJECTED')} className="text-red-700">Reject</button></>}
          {!isStudent && item.status === 'ACCEPTED' && <button onClick={() => changeRequest(item.id, 'PATCH', 'COMPLETED')} className="text-indigo-700">Mark completed</button>}
        </div>
      </article>)}
      {!requests.length && !error && <p>No requests yet.</p>}
    </div>
    <nav aria-label="Mentorship request pages" className="mt-8 flex gap-4">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </nav>
  </section>
}
