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
        .then((result) => {
          setJobs(result.data || [])
          setPages(result.pagination?.totalPages || 1)
          setError('')
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [search, location, type, page])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
        NST Career Network
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
        Career Opportunities
      </h1>
      <p className="mt-2 text-base text-slate-600">
        Discover engineering roles, tech internships, and career opportunities shared directly by Newton School of Technology alumni.
      </p>

      {/* Filter and Search Bar */}
      <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Search
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
              setLoading(true)
            }}
            placeholder="Title, skills, or company"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Location
          <input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              setPage(1)
              setLoading(true)
            }}
            placeholder="e.g. Bengaluru, Remote"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Employment Type
          <input
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setPage(1)
              setLoading(true)
            }}
            placeholder="Full-time, Internship…"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </label>
      </div>

      {loading && (
        <p className="mt-10 text-center text-sm text-slate-500" role="status">
          Loading NST job postings…
        </p>
      )}
      {error && (
        <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {jobs.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md"
                >
                  <div>
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {job.employmentType}
                    </span>
                    <h2 className="mt-3 text-lg font-bold text-[#172B45]">{job.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-[#0878D1]">{job.company}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      📍 {job.location || 'Remote / Unspecified'}
                      {job.experienceLevel ? ` • ${job.experienceLevel}` : ''}
                    </p>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline"
                    >
                      View Details & Apply →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F7F9FC] p-10 text-center text-slate-600">
              <p className="text-base font-semibold text-slate-800">No active job listings match these filters.</p>
              <p className="mt-1 text-sm text-slate-500">Check back soon or explore the alumni directory to connect with hiring managers.</p>
            </div>
          )}

          <nav aria-label="Job pages" className="mt-10 flex items-center justify-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage(page - 1)
                setLoading(true)
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-600">
              Page {page} of {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => {
                setPage(page + 1)
                setLoading(true)
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        </>
      )}
    </section>
  )
}
