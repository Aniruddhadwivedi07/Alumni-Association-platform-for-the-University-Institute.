import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function DonationHistory() {
  const [donations, setDonations] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    apiRequest(`/donations/my-history?page=${page}&limit=10`)
      .then((result) => {
        if (!isMounted) return
        setDonations(result.data || [])
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
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <Link
          to="/donations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0878D1] hover:underline"
        >
          ← Back to Campaigns
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            Giving Records
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45]">
            My Donation History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            View your past contributions and download official receipts for tax deduction.
          </p>
        </div>
      </div>

      {loading && (
        <p role="status" className="mt-12 text-center text-sm text-slate-500">
          Loading your donation records…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8 space-y-4">
          {donations.length > 0 ? (
            donations.map((donation) => (
              <article
                key={donation.transactionId}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center"
              >
                <div>
                  <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    {donation.status || 'COMPLETED'}
                  </span>
                  <h2 className="mt-2 text-base font-bold text-[#172B45]">
                    {donation.campaignTitle}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Transaction ID: <span className="font-mono">{donation.transactionId}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    📅 {new Date(donation.donationDate).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className="text-xl font-extrabold text-[#172B45]">
                    ₹{Number(donation.amount).toLocaleString()}
                  </span>
                  {donation.receiptAvailable && (
                    <a
                      href={`/api/donations/transactions/${donation.transactionId}/receipt`}
                      download
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#0878D1] bg-[#EAF2FF] px-3.5 py-1.5 text-xs font-semibold text-[#0878D1] hover:bg-sky-100 transition"
                    >
                      <span>📥 Download PDF Receipt</span>
                    </a>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-base font-semibold text-slate-800">No donations made yet.</p>
              <p className="mt-1 text-sm text-slate-500">Your contributions will appear here along with official downloadable receipts.</p>
              <Link
                to="/donations"
                className="mt-5 inline-block rounded-xl bg-[#0878D1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2]"
              >
                Explore Active Campaigns
              </Link>
            </div>
          )}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Donation history pages" className="mt-10 flex items-center justify-center gap-4">
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
    </section>
  )
}
