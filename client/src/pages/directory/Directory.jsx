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
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Find your people</p>
      <h1 className="mt-2 text-3xl font-bold">Alumni directory</h1>
      <p className="mt-3 text-slate-600">Search alumni by name, department, role, company, or graduation year.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="directory-search" className="block text-sm font-semibold">Search alumni</label>
          <input id="directory-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Name, department, company…" className="w-full rounded-lg border border-slate-300 px-4 py-3" />
        </div>
        <div className="space-y-2">
          <label htmlFor="directory-year" className="block text-sm font-semibold">Graduation year</label>
          <select id="directory-year" value={year} onChange={(event) => { setYear(event.target.value); setPage(1) }} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3">
            <option value="">All years</option>
            {Array.from({ length: 51 }, (_, index) => 2026 - index).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>
      {loading && <p className="mt-8" role="status">Loading alumni…</p>}
      {error && <p role="alert" className="mt-8 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
      {!loading && !error && (
        <>
          <p className="mt-6 text-sm text-slate-600">{total} {total === 1 ? 'alumnus' : 'alumni'} found</p>
          {visible.length ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((person) => (
                <article key={person.id || person.userId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-800" aria-hidden="true">{person.fullName?.charAt(0)?.toUpperCase() || 'A'}</div>
                  <h2 className="mt-4 text-lg font-bold">{person.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-600">{person.currentJobTitle || 'Alumni'}{person.currentCompany ? ` · ${person.currentCompany}` : ''}</p>
                  <p className="mt-3 text-sm text-slate-500">{person.department || 'Department not listed'}{person.graduationYear ? ` · Class of ${person.graduationYear}` : ''}</p>
                  {person.linkedinUrl && <a href={person.linkedinUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-indigo-700 hover:underline">LinkedIn profile</a>}
                </article>
              ))}
            </div>
          ) : <p className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-slate-600">No alumni match your search yet.</p>}
          <nav aria-label="Directory pages" className="mt-8 flex items-center justify-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50">Previous</button>
            <span className="text-sm text-slate-600">Page {page} of {pageCount}</span>
            <button disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50">Next</button>
          </nav>
        </>
      )}
    </section>
  )
}
