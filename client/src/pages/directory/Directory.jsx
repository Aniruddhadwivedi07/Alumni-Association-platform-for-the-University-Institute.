import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

const PAGE_SIZE = 8

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration'
]

export default function Directory() {
  const [alumni, setAlumni] = useState([])
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [department, setDepartment] = useState('')
  const [company, setCompany] = useState('')
  const [sortBy, setSortBy] = useState('fullName')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [selectedAlumni, setSelectedAlumni] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sortBy,
      sortOrder
    })
    if (search.trim()) params.set('search', search.trim())
    if (year) params.set('graduationYear', year)
    if (department && department !== 'All Departments') params.set('department', department)
    if (company.trim()) params.set('company', company.trim())

    let isMounted = true
    const timer = setTimeout(() => {
      apiRequest(`/directory/alumni?${params}`)
        .then((data) => {
          if (!isMounted) return
          setAlumni(data.data || [])
          setPageCount(data.pagination?.totalPages || 1)
          setTotal(data.pagination?.totalRecords || 0)
          setError('')
        })
        .catch((err) => {
          if (!isMounted) return
          setError(err.message)
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [search, year, department, company, sortBy, sortOrder, page])

  const hasActiveFilters = Boolean(
    search.trim() || year || (department && department !== 'All Departments') || company.trim()
  )

  const clearFilters = () => {
    setSearch('')
    setYear('')
    setDepartment('')
    setCompany('')
    setSortBy('fullName')
    setSortOrder('asc')
    setPage(1)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            Alumni Network
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
            Alumni Directory
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Discover fellow graduates, connect across industries, and expand your professional network with alumni worldwide.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
            {total} Verified {total === 1 ? 'Alumnus' : 'Alumni'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Keyword Search */}
          <div className="space-y-1.5">
            <label htmlFor="directory-search" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Search by Keyword
            </label>
            <input
              id="directory-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Name, role, skills, keywords…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>

          {/* Department Filter */}
          <div className="space-y-1.5">
            <label htmlFor="directory-department" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Department / Discipline
            </label>
            <select
              id="directory-department"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept === 'All Departments' ? '' : dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Graduation Year */}
          <div className="space-y-1.5">
            <label htmlFor="directory-year" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Graduation Year
            </label>
            <select
              id="directory-year"
              value={year}
              onChange={(e) => {
                setYear(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            >
              <option value="">All Cohort Years</option>
              {Array.from({ length: 30 }, (_, index) => 2026 - index).map((value) => (
                <option key={value} value={value}>
                  Class of {value}
                </option>
              ))}
            </select>
          </div>

          {/* Company / Employer */}
          <div className="space-y-1.5">
            <label htmlFor="directory-company" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Company / Employer
            </label>
            <input
              id="directory-company"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value)
                setPage(1)
              }}
              placeholder="e.g. Google, Microsoft, Startup…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>
        </div>

        {/* Sorting and Clear Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold uppercase tracking-wider text-slate-500">Sort by:</span>
            <button
              type="button"
              onClick={() => {
                setSortBy('fullName')
                setSortOrder(sortBy === 'fullName' && sortOrder === 'asc' ? 'desc' : 'asc')
              }}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                sortBy === 'fullName'
                  ? 'bg-[#EAF2FF] text-[#0878D1] font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Name {sortBy === 'fullName' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('graduationYear')
                setSortOrder(sortBy === 'graduationYear' && sortOrder === 'desc' ? 'asc' : 'desc')
              }}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                sortBy === 'graduationYear'
                  ? 'bg-[#EAF2FF] text-[#0878D1] font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Class Year {sortBy === 'graduationYear' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('currentCompany')
                setSortOrder(sortBy === 'currentCompany' && sortOrder === 'asc' ? 'desc' : 'asc')
              }}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                sortBy === 'currentCompany'
                  ? 'bg-[#EAF2FF] text-[#0878D1] font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Company {sortBy === 'currentCompany' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 font-semibold text-[#0878D1] hover:underline"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-12 text-center text-sm text-slate-500" role="status">
          Loading alumni directory records…
        </div>
      )}

      {/* Error State */}
      {error && (
        <p role="alert" className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {/* Data Results */}
      {!loading && !error && (
        <>
          {alumni.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {alumni.map((person) => (
                <article
                  key={person.id || person.userId}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    {/* Header Avatar and Badge */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878D1] to-[#004B87] text-base font-bold text-white shadow-xs"
                        aria-hidden="true"
                      >
                        {person.fullName?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-bold text-[#172B45]">{person.fullName}</h2>
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {person.graduationYear ? `Class of ${person.graduationYear}` : 'Alumni'}
                        </span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="mt-4 space-y-1">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-800">
                        {person.currentJobTitle || 'Professional'}
                      </p>
                      <p className="line-clamp-1 text-xs font-medium text-[#0878D1]">
                        {person.currentCompany ? `@ ${person.currentCompany}` : 'Community Member'}
                      </p>
                    </div>

                    {/* Department */}
                    <p className="mt-2 text-xs text-slate-500">
                      📚 {person.department || 'Engineering & Technology'}
                    </p>

                    {/* Bio Snippet */}
                    {person.bio && (
                      <p className="mt-3 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                        {person.bio}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 border-t border-slate-100 pt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAlumni(person)}
                        className="text-xs font-semibold text-[#0878D1] hover:underline"
                      >
                        View Profile →
                      </button>
                      {person.linkedinUrl && (
                        <a
                          href={person.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-slate-500 hover:text-[#0878D1]"
                          title="Open LinkedIn Profile"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                    <Link
                      to={`/mentorship?mentorId=${person.userId}`}
                      className="w-full text-center rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#EAF2FF] hover:border-[#0878D1] hover:text-[#0878D1] transition"
                    >
                      Connect / Request Mentorship
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* PS Mandated Empty State */
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-3xl text-[#0878D1]">
                🎓
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#172B45]">
                Your Alumni Network Starts Here.
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 leading-relaxed">
                Discover fellow alumni, explore professional journeys and build meaningful connections.
              </p>
              {hasActiveFilters && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0878D1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
                  >
                    Clear Filter Criteria
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <nav aria-label="Directory pages" className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {pageCount}
              </span>
              <button
                disabled={page >= pageCount}
                onClick={() => setPage(page + 1)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}

      {/* Profile Details Modal */}
      {selectedAlumni && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAlumni(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0878D1] to-[#004B87] text-2xl font-bold text-white shadow-xs">
                  {selectedAlumni.fullName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#172B45]">{selectedAlumni.fullName}</h3>
                  <p className="text-sm font-medium text-slate-600">
                    {selectedAlumni.currentJobTitle || 'Alumni Member'}
                    {selectedAlumni.currentCompany ? ` @ ${selectedAlumni.currentCompany}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlumni(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 divide-y divide-slate-100 text-sm">
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Background</span>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedAlumni.department || 'Not specified'}
                  {selectedAlumni.graduationYear ? ` • Class of ${selectedAlumni.graduationYear}` : ''}
                </p>
              </div>

              {selectedAlumni.bio && (
                <div className="pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">About / Professional Journey</span>
                  <p className="mt-1 text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedAlumni.bio}
                  </p>
                </div>
              )}

              {selectedAlumni.linkedinUrl && (
                <div className="pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Public Profile</span>
                  <p className="mt-1">
                    <a
                      href={selectedAlumni.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:underline"
                    >
                      Connect on LinkedIn ↗
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                to={`/mentorship?mentorId=${selectedAlumni.userId}`}
                className="flex-1 rounded-xl bg-[#0878D1] py-2.5 text-center text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
              >
                Request Mentorship
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAlumni(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
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
