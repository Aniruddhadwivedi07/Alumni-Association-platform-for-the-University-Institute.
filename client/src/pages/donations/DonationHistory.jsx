import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function DonationHistory() {
  const [donations, setDonations] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/donations/my-history?page=${page}&limit=10`)
      .then((result) => { setDonations(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
      .catch((err) => setError(err.message))
  }, [page])

  return <section className="mx-auto max-w-4xl px-6 py-12">
    <h1 className="text-3xl font-bold">My donations</h1>
    {error && <p role="alert" className="mt-5 text-red-700">{error}</p>}
    <div className="mt-8 space-y-4">
      {donations.map((donation) => <article key={donation.transactionId} className="rounded-xl border bg-white p-5">
        <h2 className="font-bold">{donation.campaignTitle}</h2>
        <p className="mt-2">{donation.currency} {Number(donation.amount).toLocaleString()} · {donation.status}</p>
        <p className="mt-1 text-sm text-slate-600">{new Date(donation.donationDate).toLocaleString()}</p>
        {donation.receiptAvailable && <a href={`/api/donations/transactions/${donation.transactionId}/receipt`} className="mt-3 inline-block text-indigo-700">Download receipt</a>}
      </article>)}
      {!donations.length && !error && <p>No donations yet. <Link to="/donations" className="text-indigo-700">Browse campaigns</Link></p>}
    </div>
    <nav aria-label="Donation history pages" className="mt-8 flex gap-4">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </nav>
  </section>
}
