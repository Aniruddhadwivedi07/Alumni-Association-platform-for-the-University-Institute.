import { useEffect, useState, useMemo, useCallback } from 'react'
import { AdminCard, StatCard } from '../../components/admin/AdminCard'
import { AdminTable, StatusBadge } from '../../components/admin/AdminTable'
import { apiRequest } from '../../lib/api'

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Map mentorship status to StatusBadge variant:
 *  PENDING   → amber (SUBMITTED)
 *  ACCEPTED  → emerald (ACTIVE)
 *  REJECTED  → rose (REJECTED)
 *  COMPLETED → emerald (RESOLVED)
 *  CANCELLED → slate (INACTIVE)
 */
function statusBadgeProps(status) {
  const map = {
    PENDING:   { status: 'SUBMITTED',  label: 'Pending' },
    ACCEPTED:  { status: 'ACTIVE',     label: 'Accepted' },
    REJECTED:  { status: 'REJECTED',   label: 'Rejected' },
    COMPLETED: { status: 'RESOLVED',   label: 'Completed' },
    CANCELLED: { status: 'INACTIVE',   label: 'Cancelled' },
  }
  return map[status] || { status, label: status }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminMentorship() {
  // All requests loaded (received by all alumni visible to admin)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [selectedRequest, setSelectedRequest] = useState(null)

  const [actionDialog, setActionDialog] = useState(null) // { type: 'ACCEPT'|'REJECT'|'COMPLETE', request }
  const [actionLoading, setActionLoading] = useState(false)

  const [notification, setNotification] = useState(null) // { type, message }

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchRequests = useCallback(() => {
    apiRequest('/mentorship/requests/received?limit=50')
      .then((res) => {
        setRequests(res.data || res.requests || [])
        setError('')
      })
      .catch((err) => {
        setError(err.message || 'Failed to load mentorship requests.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // ── Notifications ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 5000)
    return () => clearTimeout(t)
  }, [notification])

  // ── Derived Stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = requests.length
    const pending   = requests.filter((r) => r.status === 'PENDING').length
    const accepted  = requests.filter((r) => r.status === 'ACCEPTED').length
    const rejected  = requests.filter((r) => r.status === 'REJECTED').length
    const completed = requests.filter((r) => r.status === 'COMPLETED').length
    const cancelled = requests.filter((r) => r.status === 'CANCELLED').length
    return { total, pending, accepted, rejected, completed, cancelled }
  }, [requests])

  // ── Filtered Data ──────────────────────────────────────────────────────────

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const mentorName =
        r.mentor?.alumniProfile?.fullName || r.mentor?.email || ''
      const menteeName =
        r.student?.alumniProfile?.fullName || r.student?.email || ''

      const matchesSearch =
        !search ||
        mentorName.toLowerCase().includes(search.toLowerCase()) ||
        menteeName.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'ALL' || r.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [requests, search, statusFilter])

  // ── Moderation Action ──────────────────────────────────────────────────────

  const handleConfirmAction = async () => {
    if (!actionDialog) return
    const { type, request } = actionDialog
    setActionLoading(true)

    const statusMap = {
      ACCEPT:   'ACCEPTED',
      REJECT:   'REJECTED',
      COMPLETE: 'COMPLETED',
    }
    const newStatus = statusMap[type]

    try {
      // PATCH /api/mentorship/requests/:requestId/status
      await apiRequest(`/mentorship/requests/${request.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })

      setNotification({
        type: 'success',
        message: `Request #${request.id} has been marked as ${newStatus.toLowerCase()}.`,
      })
      setActionDialog(null)
      fetchRequests()
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Action failed. Please try again.',
      })
      setActionDialog(null)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Table Columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.id}</span>,
    },
    {
      key: 'mentor',
      header: 'Mentor',
      render: (row) =>
        row.mentor?.alumniProfile?.fullName ||
        row.mentor?.email ||
        `User #${row.mentorId}`,
    },
    {
      key: 'student',
      header: 'Mentee',
      render: (row) =>
        row.student?.alumniProfile?.fullName ||
        row.student?.email ||
        `User #${row.studentId}`,
    },
    {
      key: 'createdAt',
      header: 'Requested',
      render: (row) => fmtDate(row.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const { status, label } = statusBadgeProps(row.status)
        return <StatusBadge status={status} label={label} />
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedRequest(row)}
            className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Details
          </button>
          {row.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => setActionDialog({ type: 'ACCEPT', request: row })}
                className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setActionDialog({ type: 'REJECT', request: row })}
                className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
              >
                Reject
              </button>
            </>
          )}
          {row.status === 'ACCEPTED' && (
            <button
              type="button"
              onClick={() => setActionDialog({ type: 'COMPLETE', request: row })}
              className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Mark Complete
            </button>
          )}
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mentorship Management</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Oversee mentor–mentee pairing requests and manage their status transitions.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Requests" value={loading ? '…' : stats.total} icon="🤝" />
        <StatCard label="Pending" value={loading ? '…' : stats.pending} icon="⏳" changeType="neutral" />
        <StatCard label="Accepted" value={loading ? '…' : stats.accepted} icon="✅" changeType="positive" />
        <StatCard label="Rejected" value={loading ? '…' : stats.rejected} icon="❌" changeType="negative" />
        <StatCard label="Completed" value={loading ? '…' : stats.completed} icon="🎓" changeType="positive" />
        <StatCard label="Cancelled" value={loading ? '…' : stats.cancelled} icon="🚫" changeType="negative" />
      </div>

      {/* Filters and Table */}
      <AdminCard
        title="Mentorship Requests"
        subtitle={`${filteredRequests.length} record(s) shown`}
        action={
          <button
            type="button"
            onClick={fetchRequests}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            ↻ Refresh
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by mentor or mentee name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading mentorship requests…</div>
        ) : (
          <AdminTable
            columns={columns}
            data={filteredRequests}
            emptyMessage="No mentorship requests found."
          />
        )}
      </AdminCard>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                Mentorship Request #{selectedRequest.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Mentor</span>
                  <p className="mt-1 font-medium text-slate-800">
                    {selectedRequest.mentor?.alumniProfile?.fullName ||
                      selectedRequest.mentor?.email ||
                      `User #${selectedRequest.mentorId}`}
                  </p>
                  {selectedRequest.mentor?.alumniProfile?.currentJobTitle && (
                    <p className="text-xs text-slate-500">
                      {selectedRequest.mentor.alumniProfile.currentJobTitle}
                      {selectedRequest.mentor.alumniProfile.currentCompany
                        ? ` · ${selectedRequest.mentor.alumniProfile.currentCompany}`
                        : ''}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Mentee</span>
                  <p className="mt-1 font-medium text-slate-800">
                    {selectedRequest.student?.alumniProfile?.fullName ||
                      selectedRequest.student?.email ||
                      `User #${selectedRequest.studentId}`}
                  </p>
                  {selectedRequest.student?.alumniProfile?.department && (
                    <p className="text-xs text-slate-500">
                      {selectedRequest.student.alumniProfile.department}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
                  <div className="mt-1">
                    <StatusBadge
                      status={statusBadgeProps(selectedRequest.status).status}
                      label={statusBadgeProps(selectedRequest.status).label}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Requested On</span>
                  <p className="mt-1 font-medium text-slate-800">{fmtDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Last Updated</span>
                  <p className="mt-1 font-medium text-slate-800">{fmtDate(selectedRequest.updatedAt)}</p>
                </div>
              </div>

              {selectedRequest.message && (
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Message from Mentee</span>
                  <div className="mt-1.5 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                    {selectedRequest.message}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedRequest.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const r = selectedRequest
                      setSelectedRequest(null)
                      setActionDialog({ type: 'ACCEPT', request: r })
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Accept Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const r = selectedRequest
                      setSelectedRequest(null)
                      setActionDialog({ type: 'REJECT', request: r })
                    }}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Reject Request
                  </button>
                </>
              )}
              {selectedRequest.status === 'ACCEPTED' && (
                <button
                  type="button"
                  onClick={() => {
                    const r = selectedRequest
                    setSelectedRequest(null)
                    setActionDialog({ type: 'COMPLETE', request: r })
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setActionDialog(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {actionDialog.type === 'ACCEPT' && 'Confirm: Accept Mentorship Request'}
              {actionDialog.type === 'REJECT' && 'Confirm: Reject Mentorship Request'}
              {actionDialog.type === 'COMPLETE' && 'Confirm: Mark as Completed'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {actionDialog.type === 'ACCEPT' && (
                <>
                  Accept the mentorship request{' '}
                  <span className="font-semibold text-slate-900">#{actionDialog.request.id}</span>?
                  The mentee will be notified and the pairing will become active.
                </>
              )}
              {actionDialog.type === 'REJECT' && (
                <>
                  Reject the mentorship request{' '}
                  <span className="font-semibold text-slate-900">#{actionDialog.request.id}</span>?
                  This action cannot be undone.
                </>
              )}
              {actionDialog.type === 'COMPLETE' && (
                <>
                  Mark request{' '}
                  <span className="font-semibold text-slate-900">#{actionDialog.request.id}</span> as
                  completed? This signals that the mentorship engagement has ended successfully.
                </>
              )}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setActionDialog(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${
                  actionDialog.type === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : actionDialog.type === 'ACCEPT'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {actionLoading
                  ? 'Processing…'
                  : actionDialog.type === 'ACCEPT'
                  ? 'Confirm Accept'
                  : actionDialog.type === 'REJECT'
                  ? 'Confirm Reject'
                  : 'Confirm Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

