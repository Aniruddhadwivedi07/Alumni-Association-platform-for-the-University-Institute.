import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

const PRESET_AMOUNTS = [500, 1000, 2500, 5000]

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
  const [amount, setAmount] = useState('1000')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    apiRequest(`/donations/campaigns/${campaignId}`)
      .then((result) => {
        if (!isMounted) return
        setCampaign(result.data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message)
      })

    return () => {
      isMounted = false
    }
  }, [campaignId])

  async function donate(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || !/^\d+(\.\d{1,2})?$/.test(String(amount))) {
      return setError('Enter a valid amount with up to two decimal places.')
    }
    setBusy(true)
    try {
      await loadCheckout()
      const result = await apiRequest(`/donations/campaigns/${campaignId}/donate`, {
        method: 'POST',
        body: JSON.stringify({ amount: value })
      })
      const order = result.data
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Alumni Association',
        description: campaign.title,
        order_id: order.orderId,
        handler: async (payment) => {
          try {
            await apiRequest('/donations/verify', {
              method: 'POST',
              body: JSON.stringify({ ...payment, transactionId: order.transactionId })
            })
            setMessage('Payment verified. Thank you for your valuable contribution to the community.')
          } catch (err) {
            setError(err.message)
          }
          setBusy(false)
        },
        modal: { ondismiss: () => setBusy(false) }
      })
      checkout.open()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">
        {error || 'Loading campaign details…'}
      </div>
    )
  }

  const raised = Number(campaign.raisedAmount || 0)
  const target = Number(campaign.targetAmount || 1)
  const percent = Math.min(100, Math.round((raised / target) * 100))

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <Link
          to="/donations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0878D1] hover:underline"
        >
          ← Back to All Campaigns
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
        <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
          Institutional Giving Initiative
        </span>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
          {campaign.title}
        </h1>

        <div className="mt-6 rounded-2xl bg-slate-50 p-6 border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#0878D1]">Fundraising Progress</span>
            <span className="text-slate-600">{percent}% of Goal</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0878D1] to-[#004B87] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 text-sm">
              ₹{raised.toLocaleString()} raised
            </span>
            <span className="text-slate-500">
              Target: ₹{target.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-8 prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {campaign.description}
        </div>

        {/* Contribution Form */}
        <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-[#172B45]">Make a Contribution</h2>
          <p className="mt-1 text-xs text-slate-500">
            Select a preset amount or specify a custom contribution.
          </p>

          {session ? (
            <form onSubmit={donate} className="mt-6 space-y-6">
              {/* Preset buttons */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Quick Select Amount
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                        String(amount) === String(val)
                          ? 'bg-[#0878D1] text-white shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label htmlFor="custom-amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Contribution Amount (INR)
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">₹</span>
                  <input
                    id="custom-amount"
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#0878D1] py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#0665B2] transition disabled:opacity-50"
              >
                {busy ? 'Initiating Gateway…' : `Contribute ₹${Number(amount || 0).toLocaleString()} Now`}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center border border-slate-200">
              <p className="text-sm text-slate-700">Please sign in to make a tax-deductible contribution and access your donation receipts.</p>
              <Link
                to="/login"
                className="mt-3 inline-block rounded-xl bg-[#0878D1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2]"
              >
                Sign In to Contribute
              </Link>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              {error}
            </p>
          )}

          {message && (
            <div role="status" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
              <p className="font-semibold">{message}</p>
              <Link to="/donations/history" className="mt-2 inline-block font-semibold underline">
                View My Donations & Download Receipt →
              </Link>
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="mt-10 divide-y divide-slate-100 border-t border-slate-100 pt-6 text-xs text-slate-600 space-y-4">
          <div className="pt-2">
            <h4 className="font-bold text-slate-900">Are donations tax deductible?</h4>
            <p className="mt-1 leading-relaxed">
              Yes, receipts are generated instantly and donations are eligible for deduction under Section 80G of the Income Tax Act.
            </p>
          </div>
          <div className="pt-4">
            <h4 className="font-bold text-slate-900">How do I download my receipt?</h4>
            <p className="mt-1 leading-relaxed">
              Once payment is verified, you can download a generated PDF receipt anytime from your <Link to="/donations/history" className="text-[#0878D1] font-semibold underline">Donation History</Link> page.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
