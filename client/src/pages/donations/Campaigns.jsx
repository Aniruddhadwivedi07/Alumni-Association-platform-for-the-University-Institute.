import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/donations/campaigns?page=${page}&limit=9`)
      .then((result) => {
        setCampaigns(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
        NST Giving Programs
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
        Institutional Giving
      </h1>
      <p className="mt-2 text-base text-slate-600">
        Support Newton School of Technology students, competitive coding teams, and state-of-the-art campus tech labs.
      </p>

      {loading && (
        <p role="status" className="mt-10 text-center text-sm text-slate-500">
          Loading active campaigns…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md"
            >
              <div>
                <span className="inline-block rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-xs font-semibold text-[#0878D1]">
                  🎯 Active Campaign
                </span>
                <h2 className="mt-3 text-lg font-bold text-[#172B45]">{campaign.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600 leading-relaxed">
                  {campaign.description}
                </p>
                <div className="mt-4 rounded-xl bg-[#F7F9FC] p-3 text-xs border border-slate-100">
                  <span className="font-semibold text-slate-600">Fundraising Target: </span>
                  <span className="font-bold text-[#172B45]">
                    {campaign.currency || 'INR'} {Number(campaign.targetAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <Link
                  to={`/donations/${campaign.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:underline"
                >
                  View Campaign & Contribute →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && !campaigns.length && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F7F9FC] p-10 text-center text-slate-600">
          <p className="text-base font-semibold text-slate-800">No active fundraising campaigns right now.</p>
          <p className="mt-1 text-sm text-slate-500">Check back soon for new student grant and campus development campaigns.</p>
        </div>
      )}

      <nav aria-label="Campaign pages" className="mt-10 flex items-center justify-center gap-4">
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
