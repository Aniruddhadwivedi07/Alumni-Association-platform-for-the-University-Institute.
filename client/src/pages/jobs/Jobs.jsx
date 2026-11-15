import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { DEMO_JOBS } from '../../data/demoJobs'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDemoJob, setSelectedDemoJob] = useState(null)

  const fetchJobs = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '9' })
    if (search.trim()) params.set('search', search.trim())
    if (location.trim()) params.set('location', location.trim())
    if (type) params.set('employmentType', type)

    apiRequest(`/jobs?${params}`)
      .then((result) => {
        setJobs(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => {
        setError(err.message || 'Unable to load jobs at this time.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs()
    }, 250)
    return () => clearTimeout(timer)
  }, [search, location, type, page])

  const hasActiveFilters = Boolean(search.trim() || location.trim() || type)

  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setType('')
    setPage(1)
  }

  // Determine if using demo listings:
  // When request succeeds (!error && !loading) and database has 0 records, without active filters.
  const isUsingDemo = !loading && !error && jobs.length === 0 && !hasActiveFilters

  const displayedJobs = isUsingDemo
    ? DEMO_JOBS
    : jobs

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            Career Opportunities
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
            Alumni & Partner Job Board
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Discover internships, engineering roles, and career leadership opportunities shared by alumni and recruiters.
          </p>
        </div>
        <div className="text-right">
          {isUsingDemo ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-bold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Demo Showcase ({DEMO_JOBS.length} Openings)
            </span>
          ) : (
            <Link
              to="/my-jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0878D1] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
            >
              Post an Opportunity +
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Search by Keyword
            </label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Job title, role, or company…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                setPage(1)
              }}
              placeholder="City, Remote, Hybrid…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Employment Type
            </label>
            <input
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setPage(1)
              }}
              placeholder="Full-time, Internship, Contract…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 text-xs">
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[#0878D1] hover:underline"
            >
              Clear all filters ✕
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div role="status" className="mt-12 text-center text-sm text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0878D1] border-r-transparent align-[-0.125em]" />
          <p className="mt-3 font-medium text-slate-600">Loading career listings…</p>
        </div>
      )}

      {/* Error state with Retry */}
      {!loading && error && (
        <div role="alert" className="mt-12 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="font-semibold">Unable to load job listings</p>
          </div>
          <p className="mt-2 text-rose-700">{error}</p>
          <button
            type="button"
            onClick={fetchJobs}
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
                  <span className="mt-0.5 text-xl">💼</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Demo Listings
                      </span>
                      <h3 className="text-sm font-bold text-amber-900">
                        Sample Job Board Showcase
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
                      No active job postings are currently published in the database. Below are illustrative opportunities showcasing hiring across top tech and core disciplines.
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-200/80 px-3.5 py-1.5 text-xs font-semibold text-amber-900">
                  Applications Disabled for Demo
                </span>
              </div>
            </div>
          )}

          {/* Job Cards Grid */}
          {displayedJobs.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedJobs.map((job) => {
                if (job.isDemo) {
                  return (
                    <article
                      key={job.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                    >
                      <div>
                        {/* Top row: Badge and Company Logo */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                            {job.companyLogo ? (
                              <img
                                src={job.companyLogo}
                                alt={job.company}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-slate-500">
                                {job.company.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            DEMO LISTING
                          </span>
                        </div>

                        {/* Title & Company */}
                        <h2 className="mt-4 text-lg font-bold text-[#172B45] group-hover:text-[#0878D1] transition line-clamp-2">
                          {job.title}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {job.company}
                        </p>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                          📍 {job.location} • {job.employmentType}
                        </p>

                        {/* Meta tags */}
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                          {job.salaryRange && (
                            <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 font-semibold">
                              💰 {job.salaryRange}
                            </span>
                          )}
                          {job.experienceLevel && (
                            <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 font-medium">
                              🎯 {job.experienceLevel}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {job.description}
                        </p>

                        {/* Skills */}
                        {job.skillsRequired && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {job.skillsRequired.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedDemoJob(job)}
                          className="text-xs font-semibold text-[#0878D1] hover:underline cursor-pointer"
                        >
                          View Details →
                        </button>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Demo Preview
                        </span>
                      </div>
                    </article>
                  )
                }

                // Real database job card
                return (
                  <article
                    key={job.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-[#172B45] group-hover:text-[#0878D1] transition line-clamp-2">
                        {job.title}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {job.company}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        📍 {job.location || 'Location not listed'} · {job.employmentType}
                      </p>
                      {job.experienceLevel && (
                        <p className="mt-1 text-xs text-slate-500">
                          Experience: {job.experienceLevel}
                        </p>
                      )}
                      {job.description && (
                        <p className="mt-3 line-clamp-3 text-xs text-slate-600 leading-relaxed">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <Link
                        to={`/jobs/${job.id}`}
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
                No jobs match these filters
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
                Try loosening your search terms or clearing location filters to discover open positions.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Pagination (Only for real records) */}
          {!isUsingDemo && pages > 1 && (
            <nav aria-label="Job pages" className="mt-12 flex items-center justify-center gap-4">
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

      {/* Demo Job Modal Details */}
      {selectedDemoJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedDemoJob(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  {selectedDemoJob.companyLogo ? (
                    <img
                      src={selectedDemoJob.companyLogo}
                      alt={selectedDemoJob.company}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-slate-500">
                      {selectedDemoJob.company.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#172B45]">{selectedDemoJob.title}</h2>
                    <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                      DEMO LISTING
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{selectedDemoJob.company}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemoJob(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                📍 {selectedDemoJob.location}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                ⏳ {selectedDemoJob.employmentType}
              </span>
              {selectedDemoJob.salaryRange && (
                <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 font-semibold">
                  💰 {selectedDemoJob.salaryRange}
                </span>
              )}
              {selectedDemoJob.experienceLevel && (
                <span className="rounded-md bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 font-semibold">
                  🎯 {selectedDemoJob.experienceLevel}
                </span>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Job Overview & Responsibilities
              </h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedDemoJob.description}
              </p>
            </div>

            {selectedDemoJob.skillsRequired && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Required Competencies
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedDemoJob.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedDemoJob.applicationDeadline && (
              <p className="mt-6 text-xs text-slate-500">
                Application Deadline: {new Date(selectedDemoJob.applicationDeadline).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}

            {/* Application Notice for Demo */}
            <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold">Demo Listing Only</p>
                <p className="mt-0.5 text-amber-800">
                  Applications are disabled for demo opportunities. Real jobs posted by alumni allow 1-click CV submissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemoJob(null)}
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
