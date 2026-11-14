import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('Payment checkout could not load.'))
    document.body.appendChild(script)
  })
}

export default function CampaignDetails() {
  const { campaignId } = useParams()
  const { session } = useAuth()
  const [campaign, setCampaign] = useState(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    apiRequest(`/donations/campaigns/${campaignId}`)
      .then((result) => setCampaign(result.data))
      .catch((err) => setError(err.message))
  }, [campaignId])

  async function donate(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || !/^\d+(\.\d{1,2})?$/.test(amount)) return setError('Enter a valid amount with up to two decimal places.')
    setBusy(true)
    try {
      await loadCheckout()
      const result = await apiRequest(`/donations/campaigns/${campaignId}/donate`, { method: 'POST', body: JSON.stringify({ amount: value }) })
      const order = result.data
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'NST Alumni Association',
        description: campaign.title,
        order_id: order.orderId,
        handler: async (payment) => {
          try {
            await apiRequest('/donations/verify', { method: 'POST', body: JSON.stringify({ ...payment, transactionId: order.transactionId }) })
            setMessage('Payment verified. Thank you for your contribution.')
          } catch (err) { setError(err.message) }
          setBusy(false)
        },
        modal: { ondismiss: () => setBusy(false) },
      })
      checkout.open()
    } catch (err) { setError(err.message); setBusy(false) }
  }

  if (!campaign) return <p className="mx-auto max-w-3xl px-6 py-12">{error || 'Loading campaign…'}</p>
  return <section className="mx-auto max-w-3xl px-6 py-12">
    <Link to="/donations" className="text-indigo-700">← All campaigns</Link>
    <h1 className="mt-6 text-3xl font-bold">{campaign.title}</h1>
    <p className="mt-4 whitespace-pre-wrap">{campaign.description}</p>
    <p className="mt-6">Raised: {campaign.currency} {Number(campaign.raisedAmount).toLocaleString()} of {Number(campaign.targetAmount).toLocaleString()}</p>
    {session ? <form onSubmit={donate} className="mt-8 rounded-xl border bg-white p-6">
      <label className="block font-semibold">Donation amount ({campaign.currency})
        <input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 block w-full rounded border p-3" />
      </label>
      <button disabled={busy} className="mt-5 rounded bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Processing…' : 'Continue to payment'}</button>
    </form> : <p className="mt-8"><Link to="/login" className="text-indigo-700">Sign in</Link> to donate.</p>}
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {message && <p role="status" className="mt-4 text-green-700">{message} <Link to="/donations/history" className="underline">View history</Link></p>}
  </section>
}
