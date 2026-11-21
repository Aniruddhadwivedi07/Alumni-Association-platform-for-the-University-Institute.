import { useEffect, useState, useCallback } from 'react'
import { AdminCard, StatCard } from '../../components/admin/AdminCard'
import { AdminTable, StatusBadge } from '../../components/admin/AdminTable'
import { apiRequest } from '../../lib/api'

export default function AdminVerification() {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [actionDialog, setActionDialog] = useState(null) // { type: 'APPROVE' | 'REJECT' | 'REVOKE', applicant: object }
  const [revokeReason, setRevokeReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState(null) // { type: 'success' | 'error' | 'info', message: string, details?: object }

  // Load registered alumni candidates from the directory API
  const fetchApplicants = useCallback(() => {
    apiRequest('/directory/alumni?limit=50&sortBy=createdAt&sortOrder=desc')
      .then((res) => {
        setAlumni(res.data || [])
        setError('')
      })
      .catch((err) => {
        setError(err.message || 'Failed to load applicant registrations.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchApplicants()
  }, [fetchApplicants])

  // Filter applicants based on search and filters
  const filteredApplicants = alumni.filter((applicant) => {
    const matchesSearch =
      !search ||
      applicant.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      applicant.department?.toLowerCase().includes(search.toLowerCase()) ||
      applicant.currentCompany?.toLowerCase().includes(search.toLowerCase()) ||
      applicant.verification?.code?.toLowerCase().includes(search.toLowerCase())

    const matchesDept =
      !departmentFilter || applicant.department === departmentFilter

    const isVerified = applicant.verification?.status === 'VERIFIED'
    const isRevoked = applicant.verification?.status === 'REVOKED'

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VERIFIED' && isVerified) ||
      (statusFilter === 'REVOKED' && isRevoked) ||
      (statusFilter === 'UNVERIFIED' && !isVerified && !isRevoked)

    return matchesSearch && matchesDept && matchesStatus
  })

  // Extract unique departments for dropdown filter
  const departments = Array.from(
    new Set(alumni.map((a) => a.department).filter(Boolean))
  )

  // Handle Approve / Reject / Revoke Confirmation Action
  const handleConfirmAction = async () => {
    if (!actionDialog) return
    const { type, applicant } = actionDialog
    setActionLoading(true)

    try {
      const endpoint = `/admin/alumni/${applicant.id}/verify`
      const body = {
        action: type,
        status: type === 'APPROVE' ? 'APPROVED' : type === 'REVOKE' ? 'REVOKED' : 'REJECTED',
        reason: type === 'REVOKE' ? revokeReason.trim() : undefined,
        notes: `Administrative verification decision: ${type} by administrator.`,
      }

      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (type === 'APPROVE') {
        setNotification({
          type: 'success',
          message: `Successfully verified ${applicant.fullName}! Mathematical Verification Identifier: ${res.data?.verificationIdentifier}`,
          details: res.data
        })
      } else if (type === 'REVOKE') {
        setNotification({
          type: 'success',
          message: `Verification revoked for ${applicant.fullName} (${applicant.verification?.code || 'Credential'}).`,
        })
      } else {
        setNotification({
          type: 'info',
          message: `Application rejected for ${applicant.fullName}.`,
        })
      }

      setActionDialog(null)
      setRevokeReason('')
      fetchApplicants()
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || `Failed to process ${type.toLowerCase()} action.`,
      })
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      header: 'Applicant',
      key: 'fullName',
      render: (row) => (
        <div>
          <button
            type="button"
            onClick={() => setSelectedApplicant(row)}
            className="text-left font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
          >
            {row.fullName}
          </button>
          <div className="text-xs text-slate-500">
            {row.department || 'Department not specified'}
          </div>
        </div>
      ),
    },
    {
      header: 'Batch / Year',
      key: 'graduationYear',
      render: (row) => (
        <span className="font-mono text-xs">
          {row.graduationYear ? `Class of ${row.graduationYear}` : '—'}
        </span>
      ),
    },
    {
      header: 'Current Role & Org',
      key: 'currentCompany',
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">
            {row.currentJobTitle || 'Member'}
          </span>
          {row.currentCompany && (
            <span className="text-slate-500"> @ {row.currentCompany}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Verification Identifier',
      key: 'verificationCode',
      render: (row) => (
        row.verification?.code ? (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-indigo-700">
              {row.verification.code}
            </span>
            <span className="text-[10px] text-slate-400">
              {row.verification.verifiedAt ? new Date(row.verification.verifiedAt).toLocaleDateString() : ''}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-mono">Unassigned</span>
        )
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        if (row.verification?.status === 'VERIFIED') {
          return <StatusBadge status="ACTIVE" label="VERIFIED" />
        }
        if (row.verification?.status === 'REVOKED') {
          return <StatusBadge status="REJECTED" label="REVOKED" />
        }
        return <StatusBadge status="SUBMITTED" label="PENDING" />
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.verification?.status !== 'VERIFIED' ? (
            <button
              type="button"
              onClick={() => setActionDialog({ type: 'APPROVE', applicant: row })}
              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Verify
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setRevokeReason('')
                setActionDialog({ type: 'REVOKE', applicant: row })
              }}
              className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              Revoke
            </button>
          )}

          <button
            type="button"
            onClick={() => setActionDialog({ type: 'REJECT', applicant: row })}
            className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            Reject
          </button>
        </div>
      ),
    },
  ]

  // KPI Calculations
  const totalVerified = alumni.filter((a) => a.verification?.status === 'VERIFIED').length
  const totalRevoked = alumni.filter((a) => a.verification?.status === 'REVOKED').length
  const totalPending = alumni.filter((a) => !a.verification || a.verification.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Alumni Verification & Affine Modular Registry
          </h2>
          <p className="text-sm text-slate-500">
            Review applicant cohorts, allocate mathematical verification identifiers, and manage credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApplicants}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            ↻ Refresh List
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          role="status"
          className={`flex items-start justify-between rounded-xl border p-4 text-sm ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : notification.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-sky-200 bg-sky-50 text-sky-800'
          }`}
        >
          <div>
            <p className="font-semibold">{notification.message}</p>
            {notification.details && (
              <div className="mt-2 space-y-1">
                <p className="font-mono text-xs text-emerald-900">
                  Identifier: <span className="font-bold">{notification.details.verificationIdentifier}</span> • Sequence validated over prime modulus 1,000,003
                </p>
                {notification.details.publicVerificationToken && (
                  <div className="mt-1 flex items-center gap-2 rounded bg-emerald-100/80 p-2 font-mono text-xs text-emerald-900">
                    <span>Token: <span className="select-all font-bold">{notification.details.publicVerificationToken}</span></span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(notification.details.publicVerificationToken);
                        alert('Secure Public Verification Token copied to clipboard!');
                      }}
                      className="rounded border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-sans font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      Copy Token
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Registered"
          value={loading ? '…' : alumni.length}
          icon="👥"
        />
        <StatCard
          label="Verified Alumni"
          value={loading ? '…' : totalVerified}
          icon="✅"
          changeType="positive"
        />
        <StatCard
          label="Pending Review"
          value={loading ? '…' : totalPending}
          icon="⏳"
          changeType="neutral"
        />
        <StatCard
          label="Revoked Credentials"
          value={loading ? '…' : totalRevoked}
          icon="⚠️"
          changeType="negative"
        />
      </div>

      {/* Filters and Search Bar */}
      <AdminCard title="Cohort Search & Filters">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase">
              Search by Keyword or ALU Code
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, company, department, or ALU-XXXXXX"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-600"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase">
              Verification Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Pending / Unverified</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Applicants Table */}
      <AdminCard
        title="Alumni Applicants Cohort"
        subtitle={`Showing ${filteredApplicants.length} applicants matching active filters`}
      >
        <AdminTable
          columns={columns}
          data={filteredApplicants}
          loading={loading}
          error={error}
          emptyMessage="No applicants matching the current filter criteria."
        />
      </AdminCard>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedApplicant(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedApplicant.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedApplicant.department || 'Department not specified'} • Class of{' '}
                  {selectedApplicant.graduationYear || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-500">Professional Designation:</span>
                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {selectedApplicant.currentJobTitle || 'Member'}
                  {selectedApplicant.currentCompany && ` @ ${selectedApplicant.currentCompany}`}
                </p>
              </div>

              {selectedApplicant.verification?.code && (
                <div className="rounded-xl bg-indigo-50/80 p-3 border border-indigo-100">
                  <span className="font-semibold text-indigo-900 uppercase tracking-wider text-[10px]">
                    Verification Credential
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-bold text-indigo-700">
                    {selectedApplicant.verification.code}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Status: {selectedApplicant.verification.status} • Verified on {new Date(selectedApplicant.verification.verifiedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedApplicant.bio && (
                <div>
                  <span className="font-semibold text-slate-500">Background Statement:</span>
                  <p className="mt-0.5 rounded-lg bg-slate-50 p-2.5 leading-relaxed text-slate-600">
                    {selectedApplicant.bio}
                  </p>
                </div>
              )}

              {selectedApplicant.linkedinUrl && (
                <div>
                  <span className="font-semibold text-slate-500">LinkedIn Profile:</span>
                  <p className="mt-0.5">
                    <a
                      href={selectedApplicant.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      {selectedApplicant.linkedinUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedApplicant.verification?.status !== 'VERIFIED' ? (
                <button
                  type="button"
                  onClick={() => {
                    const applicant = selectedApplicant
                    setSelectedApplicant(null)
                    setActionDialog({ type: 'APPROVE', applicant })
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Verify Applicant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const applicant = selectedApplicant
                    setSelectedApplicant(null)
                    setRevokeReason('')
                    setActionDialog({ type: 'REVOKE', applicant })
                  }}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Revoke Verification
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const applicant = selectedApplicant
                  setSelectedApplicant(null)
                  setActionDialog({ type: 'REJECT', applicant })
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Reject Applicant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Approve / Revoke / Reject */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setActionDialog(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {actionDialog.type === 'APPROVE'
                ? 'Confirm Alumni Verification'
                : actionDialog.type === 'REVOKE'
                ? 'Confirm Credential Revocation'
                : 'Confirm Registration Rejection'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {actionDialog.type === 'APPROVE' ? (
                <>
                  Are you sure you want to verify{' '}
                  <span className="font-semibold text-slate-900">
                    {actionDialog.applicant.fullName}
                  </span>
                  ? This will allocate a unique sequence number and generate a mathematically derived verification identifier (ALU-XXXXXX).
                </>
              ) : actionDialog.type === 'REVOKE' ? (
                <>
                  Are you sure you want to revoke verification for{' '}
                  <span className="font-semibold text-slate-900">
                    {actionDialog.applicant.fullName}
                  </span>
                  ? Public verification lookups will immediately reflect this revocation.
                </>
              ) : (
                <>
                  Are you sure you want to reject registration for{' '}
                  <span className="font-semibold text-slate-900">
                    {actionDialog.applicant.fullName}
                  </span>
                  ? The applicant will be notified.
                </>
              )}
            </p>

            {actionDialog.type === 'REVOKE' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Reason for Revocation (Optional):
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Inaccurate academic records or disciplinary flag"
                  rows="2"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-amber-600"
                />
              </div>
            )}

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
                  actionDialog.type === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionDialog.type === 'REVOKE'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading
                  ? 'Processing…'
                  : actionDialog.type === 'APPROVE'
                  ? 'Confirm Verification'
                  : actionDialog.type === 'REVOKE'
                  ? 'Confirm Revocation'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
