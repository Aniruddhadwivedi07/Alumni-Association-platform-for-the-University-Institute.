import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

export default function MyJobs() {
  const { session } = useAuth()
  const [jobs, setJobs] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/jobs?page=${page}&limit=20`).then((result) => { setJobs(result.data || []); setPages(result.pagination?.totalPages || 1) }).catch((err) => setError(err.message))
  }, [page])

  async function deactivate(id) {
    try { await apiRequest(`/jobs/${id}`, { method: 'DELETE' }); setJobs(jobs.filter((job) => job.id !== id)) } catch (err) { setError(err.message) }
  }

  return <section className="mx-auto max-w-4xl px-6 py-12"><h1 className="text-3xl font-bold">Manage job posts</h1><Link to="/jobs/new" className="mt-5 inline-block font-semibold text-indigo-700">Post a job</Link>{error && <p role="alert" className="mt-5 text-red-700">{error}</p>}<div className="mt-6 space-y-4">{jobs.filter((job) => job.createdById === session?.id).map((job) => <article key={job.id} className="rounded-xl border bg-white p-5"><h2 className="text-xl font-bold">{job.title}</h2><p>{job.company}</p><div className="mt-3 flex gap-4"><Link to={`/jobs/${job.id}/edit`} className="text-indigo-700">Edit</Link><button onClick={() => deactivate(job.id)} className="text-red-700">Deactivate</button></div></article>)}</div><div className="mt-6 flex gap-4"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div><p className="mt-4 text-sm text-slate-500">This page shows your posts from the current results page.</p></section>
}
