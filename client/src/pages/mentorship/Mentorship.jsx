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
      .then((result) => {
        setRequests(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => setError(err.message))
  }, [isStudent, page, reload])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      await apiRequest('/mentorship/requests', {
        method: 'POST',
        body: JSON.stringify({ mentorId: Number(mentorId), message }),
      })
      setNotice('Mentorship request successfully sent.')
      setMentorId('')
      setMessage('')
      setPage(1)
      setReload(reload + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  async function changeRequest(id, method, status) {
    setError('')
    try {
      await apiRequest(`/mentorship/requests/${id}${method === 'PATCH' ? '/status' : ''}`, {
        method,
        ...(status ? { body: JSON.stringify({ status }) } : {}),
      })
      setReload(reload + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  const statusBadge = (status) => {
    const s = (status || '').toUpperCase()
    if (s === 'ACCEPTED') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (s === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200'
    if (s === 'COMPLETED') return 'bg-sky-50 text-[#0878D1] border-sky-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
        NST Mentorship Network
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
        Mentorship Program
      </h1>
      <p className="mt-2 text-base text-slate-600">
        Connect one-on-one with Newton School of Technology graduates for career navigation, system design coaching, and industry advice.
      </p>

      {isStudent && (
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <h2 className="text-xl font-bold text-[#172B45]">Request Alumni Mentorship</h2>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Choose a Mentor
            <select
              required
              value={mentorId}
              onChange={(event) => setMentorId(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            >
              <option value="">Select an alumnus mentor</option>
              {mentors.map((person) => (
                <option key={person.userId} value={person.userId}>
                  {person.fullName} — {person.currentJobTitle || person.department || 'Alumnus'} {person.currentCompany ? `(@ ${person.currentCompany})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Message & Goals
            <textarea
              maxLength="1000"
              rows="4"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Introduce yourself, your current semester/projects, and what guidance you are seeking…"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[#0878D1] px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2]"
          >
            Send Mentorship Request
          </button>
        </form>
      )}

      {notice && (
        <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {error}
        </p>
      )}

      <h2 className="mt-10 text-2xl font-bold text-[#172B45]">
        {isStudent ? 'Your Mentorship Requests' : 'Incoming Mentorship Requests'}
      </h2>

      <div className="mt-5 space-y-4">
        {requests.map((item) => (
          <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#172B45]">
                  {isStudent ? item.mentor?.fullName || `Mentor #${item.mentorId}` : item.student?.fullName || `Student #${item.studentId}`}
                </h3>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>
              {item.message && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 leading-relaxed bg-[#F7F9FC] p-3 rounded-xl border border-slate-100">
                  {item.message}
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3 text-xs font-semibold">
              {isStudent && item.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => changeRequest(item.id, 'DELETE')}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 hover:bg-rose-100"
                >
                  Withdraw Request
                </button>
              )}
              {!isStudent && item.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => changeRequest(item.id, 'PATCH', 'ACCEPTED')}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                  >
                    Accept Request
                  </button>
                  <button
                    type="button"
                    onClick={() => changeRequest(item.id, 'PATCH', 'REJECTED')}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 hover:bg-rose-100"
                  >
                    Decline
                  </button>
                </>
              )}
              {!isStudent && item.status === 'ACCEPTED' && (
                <button
                  type="button"
                  onClick={() => changeRequest(item.id, 'PATCH', 'COMPLETED')}
                  className="rounded-lg bg-[#0878D1] px-3 py-1.5 text-white hover:bg-[#0665B2]"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </article>
        ))}

        {!requests.length && !error && (
          <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-8 text-center text-slate-600">
            <p className="font-medium">No mentorship requests found.</p>
            {isStudent && <p className="mt-1 text-xs text-slate-500">Choose a mentor above to begin your mentorship journey.</p>}
          </div>
        )}
      </div>

      <nav aria-label="Mentorship request pages" className="mt-8 flex items-center justify-center gap-4">
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
