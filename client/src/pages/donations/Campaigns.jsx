import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/donations/campaigns?page=${page}&limit=9`)
      .then((result) => { setCampaigns(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
      .catch((err) => setError(err.message))
  }, [page])

  return <section className="mx-auto max-w-6xl px-6 py-12">
    <h1 className="text-3xl font-bold">Support the college</h1>
    <p className="mt-2 text-slate-600">Choose a campaign and make a contribution.</p>
    {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}
    {!error && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => <article key={campaign.id} className="rounded-xl border bg-white p-6">
        <h2 className="text-xl font-bold">{campaign.title}</h2>
        <p className="mt-3 line-clamp-3 text-slate-600">{campaign.description}</p>
        <p className="mt-3 text-sm">Goal: {campaign.currency} {Number(campaign.targetAmount).toLocaleString()}</p>
        <Link to={`/donations/${campaign.id}`} className="mt-5 inline-block font-semibold text-indigo-700">View campaign</Link>
      </article>)}
    </div>}
    {!error && !campaigns.length && <p className="mt-8">No active campaigns yet.</p>}
    <nav aria-label="Campaign pages" className="mt-8 flex justify-center gap-4">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </nav>
  </section>
}
