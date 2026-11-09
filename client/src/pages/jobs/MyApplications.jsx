import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')
  const location = useLocation()

  useEffect(() => {
    apiRequest(`/applications/me?page=${page}&limit=10`)
      .then((result) => { setApplications(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
      .catch((err) => setError(err.message))
  }, [page])

  async function withdraw(id) {
    try {
      await apiRequest(`/applications/${id}`, { method: 'DELETE' })
      setApplications(applications.map((item) => item.id === id ? { ...item, status: 'WITHDRAWN' } : item))
    } catch (err) { setError(err.message) }
  }

  return <section className="mx-auto max-w-4xl px-6 py-12"><h1 className="text-3xl font-bold">My applications</h1>{location.state?.message && <p role="status" className="mt-4 text-green-700">{location.state.message}</p>}{error && <p role="alert" className="mt-4 text-red-700">{error}</p>}<div className="mt-8 space-y-4">{applications.map((item) => <article key={item.id} className="rounded-xl border bg-white p-5"><h2 className="text-xl font-bold">{item.job?.title || 'Job application'}</h2><p className="mt-1 text-slate-600">{item.job?.company}</p><p className="mt-3">Status: <strong>{item.status}</strong></p><div className="mt-3 flex gap-4"><Link to={`/jobs/${item.jobId}`} className="text-indigo-700">View job</Link>{!['WITHDRAWN', 'ACCEPTED', 'REJECTED'].includes(item.status) && <button onClick={() => withdraw(item.id)} className="text-red-700">Withdraw</button>}</div></article>)}{!applications.length && !error && <p>No applications yet.</p>}</div><nav aria-label="Application pages" className="mt-8 flex gap-4"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></nav></section>
}
