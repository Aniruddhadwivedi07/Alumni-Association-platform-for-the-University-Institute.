import { useEffect, useState, useMemo } from 'react'
import { AdminCard, StatCard } from '../../components/admin/AdminCard'
import { AdminTable, StatusBadge } from '../../components/admin/AdminTable'
import { apiRequest } from '../../lib/api'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtCurrency(amount, currency = 'INR') {
  if (amount == null) return '—'
  const num = Number(amount)
  if (isNaN(num)) return `${currency} ${amount}`
  return `${currency} ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDonations() {
  const [activeTab, setActiveTab] = useState('transactions') // 'transactions' | 'campaigns'
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedTx, setSelectedTx] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  useEffect(() => {
    let ignore = false
    Promise.allSettled([
      apiRequest('/admin/donations/summary'),
      apiRequest('/admin/donations?limit=50'),
      apiRequest('/donations/campaigns?limit=50'),
    ])
      .then(([summaryRes, txRes, campaignsRes]) => {
        if (ignore) return
        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value.data || null)
        }
        if (txRes.status === 'fulfilled') {
          setTransactions(txRes.value.data || [])
        } else {
          setError(txRes.reason?.message || 'Failed to load transaction records.')
        }
        if (campaignsRes.status === 'fulfilled') {
          setCampaigns(campaignsRes.value.data || [])
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter
      const donorName = tx.donor?.fullName || tx.donor?.email || ''
      const campaignTitle = tx.campaign?.title || ''
      const matchesSearch =
        !search ||
        donorName.toLowerCase().includes(search.toLowerCase()) ||
        campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
        String(tx.transactionId).includes(search)
      return matchesStatus && matchesSearch
    })
  }, [transactions, statusFilter, search])

  // Computed summary metrics
  const totalSuccessful = summary?.totalSuccessfulDonations ?? transactions.filter((t) => t.status === 'SUCCESS').length
  const totalPending = summary?.totalPendingTransactions ?? transactions.filter((t) => t.status === 'PENDING').length
  const totalFailed = summary?.totalFailedTransactions ?? transactions.filter((t) => t.status === 'FAILED').length
  const totalRaisedInr = summary?.totalRaisedByCurrency?.find((c) => c.currency === 'INR')?.totalRaised ?? '0.00'

  const txColumns = [
    {
      key: 'transactionId',
      header: 'Tx ID',
      render: (row) => <span className="font-mono text-xs font-semibold text-slate-700">#{row.transactionId}</span>,
    },
    {
      key: 'donor',
      header: 'Donor',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.donor?.fullName || row.donor?.email || `User #${row.donor?.id}`}</p>
          {row.donor?.fullName && row.donor?.email && (
            <p className="text-xs text-slate-400">{row.donor.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      render: (row) => (
        <span className="max-w-[200px] truncate block" title={row.campaign?.title}>
          {row.campaign?.title || 'General Fund'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="font-semibold text-slate-900">{fmtCurrency(row.amount, row.currency)}</span>,
    },
    {
      key: 'donationDate',
      header: 'Date',
      render: (row) => fmtDate(row.donationDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const badgeMap = {
          SUCCESS: { status: 'ACTIVE', label: 'Success' },
          PENDING: { status: 'SUBMITTED', label: 'Pending' },
          FAILED:  { status: 'REJECTED', label: 'Failed' },
        }
        const b = badgeMap[row.status] || { status: 'INACTIVE', label: row.status }
        return <StatusBadge status={b.status} label={b.label} />
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTx(row)}
            className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Details
          </button>
          {row.receiptAvailable && (
            <a
              href={`/api/donations/transactions/${row.transactionId}/receipt`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Receipt PDF
            </a>
          )}
        </div>
      ),
    },
  ]

  const campaignColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.id}</span>,
    },
    {
      key: 'title',
      header: 'Campaign Title',
      cellClassName: 'font-medium text-slate-900',
      render: (row) => <span className="font-semibold text-slate-800">{row.title}</span>,
    },
    {
      key: 'targetAmount',
      header: 'Target Goal',
      render: (row) => fmtCurrency(row.targetAmount, row.currency),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => fmtDate(row.startDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.isActive ? 'ACTIVE' : 'REJECTED'}
          label={row.isActive ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedCampaign(row)}
          className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
        >
          View Details
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Donations & Campaigns Administration</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Review alumni contribution campaigns, audit transaction logs, and inspect verified payments.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Raised (INR)" value={loading ? '…' : `₹${Number(totalRaisedInr).toLocaleString()}`} icon="💰" changeType="positive" />
        <StatCard label="Successful Donations" value={loading ? '…' : totalSuccessful} icon="✅" changeType="positive" />
        <StatCard label="Pending Payments" value={loading ? '…' : totalPending} icon="⏳" changeType="neutral" />
        <StatCard label="Failed Transactions" value={loading ? '…' : totalFailed} icon="⚠️" changeType="negative" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Transactions Log ({filteredTransactions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'campaigns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Campaigns ({campaigns.length})
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Transactions View */}
      {activeTab === 'transactions' && (
        <AdminCard
          title="All Donation Transactions"
          subtitle="Real-time transaction records verified against the payment provider."
        >
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by donor, campaign, or transaction ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading transactions…</div>
          ) : (
            <AdminTable
              columns={txColumns}
              data={filteredTransactions}
              emptyMessage="No donation transactions found."
            />
          )}
        </AdminCard>
      )}

      {/* Campaigns View */}
      {activeTab === 'campaigns' && (
        <AdminCard
          title="Active Donation Campaigns"
          subtitle="Institutional causes and endowment funds accepting alumni contributions."
        >
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading campaigns…</div>
          ) : (
            <AdminTable
              columns={campaignColumns}
              data={campaigns}
              emptyMessage="No active campaigns found."
            />
          )}
        </AdminCard>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedTx(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Transaction #{selectedTx.transactionId}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Amount</span>
                  <p className="mt-0.5 text-base font-bold text-slate-900">
                    {fmtCurrency(selectedTx.amount, selectedTx.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge
                      status={selectedTx.status === 'SUCCESS' ? 'ACTIVE' : selectedTx.status === 'PENDING' ? 'SUBMITTED' : 'REJECTED'}
                      label={selectedTx.status}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Donor Name</span>
                  <p className="mt-0.5 text-slate-800">{selectedTx.donor?.fullName || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Donor Email</span>
                  <p className="mt-0.5 text-slate-800">{selectedTx.donor?.email || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Campaign</span>
                  <p className="mt-0.5 text-slate-800">{selectedTx.campaign?.title || 'General Fund'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Date</span>
                  <p className="mt-0.5 text-slate-800">{fmtDateTime(selectedTx.donationDate)}</p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                <p className="font-semibold text-slate-600">Payment Gateway Metadata</p>
                <p className="text-slate-500">Provider: <span className="font-mono text-slate-800">{selectedTx.paymentProvider || 'RAZORPAY'}</span></p>
                <p className="text-slate-500">Order ID: <span className="font-mono text-slate-800">{selectedTx.providerOrderId || '—'}</span></p>
                <p className="text-slate-500">Payment ID: <span className="font-mono text-slate-800">{selectedTx.providerPaymentId || '—'}</span></p>
              </div>

              <div className="text-xs text-slate-400 italic">
                Payment status is verified cryptographically via Razorpay HMAC signature. Manual status mutation is restricted to preserve financial audit integrity.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedTx.receiptAvailable && (
                <a
                  href={`/api/donations/transactions/${selectedTx.transactionId}/receipt`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Download Receipt PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedCampaign(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{selectedCampaign.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p className="text-slate-600">{selectedCampaign.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Target Goal</span>
                  <p className="mt-0.5 font-bold text-slate-900">
                    {fmtCurrency(selectedCampaign.targetAmount, selectedCampaign.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge
                      status={selectedCampaign.isActive ? 'ACTIVE' : 'REJECTED'}
                      label={selectedCampaign.isActive ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Start Date</span>
                  <p className="mt-0.5 text-slate-800">{fmtDate(selectedCampaign.startDate)}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">End Date</span>
                  <p className="mt-0.5 text-slate-800">{fmtDate(selectedCampaign.endDate)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
