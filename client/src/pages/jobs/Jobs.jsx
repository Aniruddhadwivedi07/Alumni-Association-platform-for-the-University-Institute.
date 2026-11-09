import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '9' })
    if (search.trim()) params.set('search', search.trim())
    if (location.trim()) params.set('location', location.trim())
    if (type) params.set('employmentType', type)
    const timer = setTimeout(() => {
      apiRequest(`/jobs?${params}`)
        .then((result) => { setJobs(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [search, location, type, page])

  return <section className="mx-auto max-w-6xl px-6 py-12">
    <h1 className="text-3xl font-bold">Jobs</h1>
    <p className="mt-2 text-slate-600">Find opportunities shared with the alumni community.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <label className="text-sm font-semibold">Search<input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); setLoading(true) }} placeholder="Title or company" className="mt-2 w-full rounded border p-3" /></label>
      <label className="text-sm font-semibold">Location<input value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); setLoading(true) }} className="mt-2 w-full rounded border p-3" /></label>
      <label className="text-sm font-semibold">Employment type<input value={type} onChange={(e) => { setType(e.target.value); setPage(1); setLoading(true) }} placeholder="Full-time, internship…" className="mt-2 w-full rounded border p-3" /></label>
    </div>
    {loading && <p className="mt-8" role="status">Loading jobs…</p>}
    {error && <p className="mt-8 text-red-700" role="alert">{error}</p>}
    {!loading && !error && (jobs.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <article key={job.id} className="rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">{job.title}</h2><p className="mt-2 text-slate-600">{job.company}</p><p className="mt-3 text-sm text-slate-500">{job.location || 'Location not listed'} · {job.employmentType}</p><Link to={`/jobs/${job.id}`} className="mt-5 inline-block font-semibold text-indigo-700">View details</Link></article>)}</div> : <p className="mt-8">No jobs match these filters.</p>)}
    <nav aria-label="Job pages" className="mt-8 flex justify-center gap-4"><button disabled={page === 1} onClick={() => { setPage(page - 1); setLoading(true) }} className="rounded border px-4 py-2 disabled:opacity-50">Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => { setPage(page + 1); setLoading(true) }} className="rounded border px-4 py-2 disabled:opacity-50">Next</button></nav>
  </section>
}
