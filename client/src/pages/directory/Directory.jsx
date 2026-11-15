import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { DEMO_ALUMNI } from '../../data/demoDirectory'

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
    setLoading(true)
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
          setError(err.message || 'Unable to load alumni directory at this time.')
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

  // Determine if using demo placeholders:
  // ONLY when request succeeded (!error && !loading) and database has 0 records, without active search/filter restrictions.
  const isUsingDemo = !loading && !error && alumni.length === 0 && !hasActiveFilters

  // Filter demo profiles locally if filters applied while in demo mode
  const displayedAlumni = isUsingDemo
    ? DEMO_ALUMNI
    : alumni

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
          {isUsingDemo ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-bold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Demo Showcase ({DEMO_ALUMNI.length} Profiles)
            </span>
          ) : (
            <span className="inline-flex items-center rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
              {total} Verified {total === 1 ? 'Alumnus' : 'Alumni'}
            </span>
          )}
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

          {/* Graduation Year Filter */}
          <div className="space-y-1.5">
            <label htmlFor="directory-year" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Graduation Year
            </label>
            <input
              id="directory-year"
              type="number"
              min="1950"
              max="2035"
              value={year}
              onChange={(e) => {
                setYear(e.target.value)
                setPage(1)
              }}
              placeholder="e.g. 2022"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>

          {/* Company Filter */}
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
              placeholder="Google, Microsoft, ISRO…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>
        </div>

        {/* Sorting & Filter Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 outline-none focus:border-[#0878D1]"
            >
              <option value="fullName">Full Name</option>
              <option value="graduationYear">Graduation Year</option>
              <option value="currentCompany">Company</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 outline-none focus:border-[#0878D1]"
            >
              <option value="asc">Ascending (A → Z)</option>
              <option value="desc">Descending (Z → A)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[#0878D1] hover:underline"
            >
              Clear all filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div role="status" className="mt-12 text-center text-sm text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0878D1] border-r-transparent align-[-0.125em]" />
          <p className="mt-3 font-medium text-slate-600">Loading directory profiles…</p>
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && error && (
        <div role="alert" className="mt-12 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="font-semibold">Unable to load alumni directory</p>
          </div>
          <p className="mt-2 text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setError('')
              apiRequest(`/directory/alumni?page=${page}&limit=${PAGE_SIZE}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
                .then((data) => {
                  setAlumni(data.data || [])
                  setPageCount(data.pagination?.totalPages || 1)
                  setTotal(data.pagination?.totalRecords || 0)
                  setError('')
                })
                .catch((err) => setError(err.message || 'Unable to load directory.'))
                .finally(() => setLoading(false))
            }}
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
                  <span className="mt-0.5 text-xl">💡</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Demo Profiles
                      </span>
                      <h3 className="text-sm font-bold text-amber-900">
                        Illustrative Alumni Directory Showcase
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
                      No alumni have been indexed in the database yet. The profiles below represent sample alumni members across industries to showcase platform networking features.
                    </p>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0878D1] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0665B2]"
                >
                  Join the Directory →
                </Link>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {displayedAlumni.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {displayedAlumni.map((member) => (
                <article
                  key={member.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0878D1]/40 hover:shadow-lg"
                >
                  <div>
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0878D1] to-[#004B87] shadow-xs">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.fullName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: member.avatar ? 'none' : 'flex' }}
                          className="h-full w-full items-center justify-center text-lg font-bold text-white"
                        >
                          {member.avatarInitials || member.fullName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                      </div>

                      {member.isDemo ? (
                        <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          DEMO PROFILE
                        </span>
                      ) : (
                        member.graduationYear && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            Class of &apos;{String(member.graduationYear).slice(-2)}
                          </span>
                        )
                      )}
                    </div>

                    {/* Member Information */}
                    <div className="mt-4">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0878D1] transition">
                        {member.fullName}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-[#0878D1] line-clamp-1">
                        {member.currentJobTitle || 'Alumni Member'}
                      </p>
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">
                        {member.currentCompany || 'Independent / Freelance'}
                      </p>

                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                          {member.department || 'Engineering'}
                        </p>
                        {member.isDemo && member.graduationYear && (
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Class of {member.graduationYear} {member.location ? `• ${member.location}` : ''}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {member.bio || 'Alumni community member active in professional networking and mentorship.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedAlumni(member)}
                      className="text-xs font-semibold text-[#0878D1] hover:underline cursor-pointer"
                    >
                      View Profile →
                    </button>
                    {member.isDemo ? (
                      <span className="text-[10px] text-slate-400 font-medium">Demo</span>
                    ) : (
                      member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 hover:text-[#0878D1]"
                          title="LinkedIn Profile"
                        >
                          LinkedIn ↗
                        </a>
                      )
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty Filter State */
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-3xl text-[#0878D1]">
                🔍
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#172B45]">
                No alumni profiles match your filters
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
                We couldn&apos;t find any verified profiles matching your criteria. Try loosening your keywords or resetting filters.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Pagination (Only for real records) */}
          {!isUsingDemo && pageCount > 1 && (
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
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0878D1] to-[#004B87] text-2xl font-bold text-white shadow-xs overflow-hidden">
                  {selectedAlumni.avatar ? (
                    <img
                      src={selectedAlumni.avatar}
                      alt={selectedAlumni.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedAlumni.fullName?.charAt(0)?.toUpperCase() || 'A'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#172B45]">{selectedAlumni.fullName}</h3>
                    {selectedAlumni.isDemo && (
                      <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                        DEMO PROFILE
                      </span>
                    )}
                  </div>
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

              {selectedAlumni.skills && (
                <div className="pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills & Focus Areas</span>
                  <p className="mt-1 text-slate-700 font-medium">
                    {selectedAlumni.skills}
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
              {selectedAlumni.isDemo ? (
                <div className="flex-1 rounded-xl bg-amber-50 border border-amber-200 py-2.5 px-3 text-center text-xs font-semibold text-amber-800">
                  Demo Profile — Mentorship request disabled
                </div>
              ) : (
                <Link
                  to={`/mentorship?mentorId=${selectedAlumni.userId}`}
                  className="flex-1 rounded-xl bg-[#0878D1] py-2.5 text-center text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
                >
                  Request Mentorship
                </Link>
              )}
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
