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
    let isMounted = true
    apiRequest(`/donations/campaigns?page=${page}&limit=9`)
      .then((result) => {
        if (!isMounted) return
        setCampaigns(result.data || [])
        setPages(result.pagination?.totalPages || 1)
        setError('')
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [page])

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            Giving & Community Support
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
            Donation Campaigns
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Contribute toward merit scholarships, research grants, lab infrastructure, and alumni emergency funds.
          </p>
        </div>
        <div>
          <Link
            to="/donations/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-[#0878D1] hover:text-[#0878D1] transition"
          >
            <span>📜 My Donation History</span>
          </Link>
        </div>
      </div>

      {loading && (
        <p role="status" className="mt-12 text-center text-sm text-slate-500">
          Loading giving initiatives…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {campaigns.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => {
                const raised = Number(campaign.raisedAmount || 0)
                const target = Number(campaign.targetAmount || 1)
                const percent = Math.min(100, Math.round((raised / target) * 100))

                return (
                  <article
                    key={campaign.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-block rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-xs font-semibold text-[#0878D1]">
                          🎯 Active Campaign
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {percent}% Funded
                        </span>
                      </div>

                      <h2 className="mt-4 text-lg font-bold text-[#172B45] leading-snug">
                        {campaign.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600 leading-relaxed">
                        {campaign.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0878D1] to-[#004B87] transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">
                            ₹{raised.toLocaleString()} raised
                          </span>
                          <span className="text-slate-500">
                            Goal: ₹{target.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <Link
                        to={`/donations/${campaign.id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#0878D1] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
                      >
                        Support this Initiative →
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            /* PS Mandated Empty State */
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-3xl text-[#0878D1]">
                🤝
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#172B45]">
                Make a Difference. Strengthen Our Community.
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 leading-relaxed">
                Your contribution can help support meaningful initiatives, create opportunities and strengthen the alumni community.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <nav aria-label="Campaign pages" className="mt-12 flex items-center justify-center gap-4">
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

      {/* Trust & Transparency Section */}
      <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50/70 p-8 sm:p-10">
        <h3 className="text-lg font-bold text-[#172B45]">Giving Transparency & Governance</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-3 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">🔒 100% Secure Processing</span>
            <p className="mt-1 leading-relaxed">
              Payments are encrypted and processed through standard banking-grade payment gateways with instant HMAC verification.
            </p>
          </div>
          <div>
            <span className="font-semibold text-slate-800">📄 Instant PDF Tax Receipts</span>
            <p className="mt-1 leading-relaxed">
              Every successful donation generates a downloadable PDF receipt complete with 80G tax exemption details.
            </p>
          </div>
          <div>
            <span className="font-semibold text-slate-800">🎯 Dedicated Allocation</span>
            <p className="mt-1 leading-relaxed">
              All contributions go directly toward student grants, laboratory facilities, and institutional development.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
