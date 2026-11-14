import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/api'

const PAGE_SIZE = 8

export default function Directory() {
  const [alumni, setAlumni] = useState([])
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (search.trim()) params.set('search', search.trim())
    if (year) params.set('graduationYear', year)
    apiRequest(`/directory/alumni?${params}`)
      .then((data) => {
        setAlumni(data.data || [])
        setPageCount(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.totalRecords || 0)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [search, year, page])

  const visible = alumni

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
        NST Alumni Roster
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
        Alumni Directory
      </h1>
      <p className="mt-2 text-base text-slate-600">
        Connect with Newton School of Technology graduates by name, cohort, specialization, role, or company.
      </p>

      {/* Filter and Search Bar */}
      <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-[1fr_220px]">
        <div className="space-y-1.5">
          <label htmlFor="directory-search" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Search alumni
          </label>
          <input
            id="directory-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Name, company, tech stack, department…"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="directory-year" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Graduation / Cohort Year
          </label>
          <select
            id="directory-year"
            value={year}
            onChange={(event) => {
              setYear(event.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          >
            <option value="">All Cohorts</option>
            {Array.from({ length: 51 }, (_, index) => 2026 - index).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-12 text-center text-sm text-slate-500" role="status">
          Loading NST alumni records…
        </div>
      )}
      {error && (
        <p role="alert" className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {total} {total === 1 ? 'member' : 'members'} found
          </p>
          {visible.length ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((person) => (
                <article
                  key={person.id || person.userId}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
                >
                  <div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-base font-bold text-[#0878D1]"
                      aria-hidden="true"
                    >
                      {person.fullName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <h2 className="mt-4 text-base font-bold text-[#172B45]">{person.fullName}</h2>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {person.currentJobTitle || 'Alumni Member'}
                      {person.currentCompany ? ` @ ${person.currentCompany}` : ''}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {person.department || 'Computer Science & AI'}
                      {person.graduationYear ? ` • Class of ${person.graduationYear}` : ''}
                    </p>
                  </div>
                  {person.linkedinUrl && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <a
                        href={person.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline"
                      >
                        LinkedIn Profile ↗
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F7F9FC] p-10 text-center text-slate-600">
              <p className="text-base font-semibold text-slate-800">No alumni matched your search criteria.</p>
              <p className="mt-1 text-sm text-slate-500">Try searching for another name or clearing cohort filters.</p>
            </div>
          )}

          <nav aria-label="Directory pages" className="mt-10 flex items-center justify-center gap-4">
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
        </>
      )}
    </section>
  )
}
