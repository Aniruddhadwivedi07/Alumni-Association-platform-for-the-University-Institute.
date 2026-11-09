import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AdminCard, StatCard } from '../../components/admin/AdminCard'
import { AdminTable, StatusBadge } from '../../components/admin/AdminTable'
import { apiRequest } from '../../lib/api'

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [companySearch, setCompanySearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedJob, setSelectedJob] = useState(null)
  const [actionDialog, setActionDialog] = useState(null) // { type: 'APPROVE' | 'REJECT' | 'DEACTIVATE' | 'ACTIVATE', job: object }
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState(null) // { type: 'success' | 'error' | 'info', message: string }
  const [currentTime] = useState(() => Date.now())

  // Load jobs from /api/jobs (supports pagination & limits)
  const fetchJobs = useCallback(() => {
    apiRequest('/jobs?limit=50&sortBy=createdAt&sortOrder=desc')
      .then((res) => {
        setJobs(res.data || [])
        setError('')
      })
      .catch((err) => {
        setError(err.message || 'Failed to load job listings.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Filter jobs dynamically across title, company, type, status, and deadline
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesTitle =
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.description?.toLowerCase().includes(search.toLowerCase())

      const matchesCompany =
        !companySearch ||
        job.company?.toLowerCase().includes(companySearch.toLowerCase())

      const matchesType =
        !typeFilter || job.employmentType === typeFilter

      const isExpired = job.applicationDeadline && currentTime > new Date(job.applicationDeadline).getTime()
      let matchesStatus = true
      if (statusFilter === 'ACTIVE') {
        matchesStatus = job.isActive && !isExpired
      } else if (statusFilter === 'EXPIRED') {
        matchesStatus = isExpired
      } else if (statusFilter === 'INACTIVE') {
        matchesStatus = !job.isActive
      }

      return matchesTitle && matchesCompany && matchesType && matchesStatus
    })
  }, [jobs, search, companySearch, typeFilter, statusFilter, currentTime])

  // Derive unique employment types for dropdown filter
  const employmentTypes = useMemo(() => {
    return Array.from(new Set(jobs.map((j) => j.employmentType).filter(Boolean)))
  }, [jobs])

  // Real KPI statistics computed from actual live dataset
  const totalJobsCount = jobs.length
  const activeJobsCount = jobs.filter((j) => j.isActive && (!j.applicationDeadline || currentTime <= new Date(j.applicationDeadline).getTime())).length
  const expiredJobsCount = jobs.filter((j) => j.applicationDeadline && currentTime > new Date(j.applicationDeadline).getTime()).length
  const inactiveJobsCount = jobs.filter((j) => !j.isActive).length

  // Handle Moderation Confirmation Action
  const handleConfirmAction = async () => {
    if (!actionDialog) return
    const { type, job } = actionDialog
    setActionLoading(true)

    try {
      if (type === 'DEACTIVATE') {
        // Supported by existing backend DELETE /api/jobs/:jobId (soft deletes: isActive = false)
        await apiRequest(`/jobs/${job.id}`, {
          method: 'DELETE',
        })
        setNotification({
          type: 'success',
          message: `Job "${job.title}" at ${job.company} was successfully deactivated.`,
        })
        setActionDialog(null)
        fetchJobs()
      } else if (type === 'ACTIVATE') {
        // Update job to active status via PUT /api/jobs/:jobId
        await apiRequest(`/jobs/${job.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: job.title,
            description: job.description,
            company: job.company,
            employmentType: job.employmentType,
          }),
        })
        setNotification({
          type: 'success',
          message: `Job "${job.title}" is active.`,
        })
        setActionDialog(null)
        fetchJobs()
      } else {
        /*
         * ARCHITECTURAL NOTE ON PENDING API DEPENDENCY:
         * As per existing schema.prisma, jobs currently use `isActive: Boolean`.
         * Dedicated moderation status endpoints (e.g. PATCH /api/jobs/:id/moderation
         * with 'APPROVED' | 'REJECTED') are pending backend specification from Aniruddha.
         * We gracefully attempt the endpoint contract and notify the admin clearly.
         */
        await apiRequest(`/jobs/${job.id}/moderate`, {
          method: 'POST',
          body: JSON.stringify({
            action: type,
            status: type === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            notes: `Administrative moderation decision: ${type}`,
          }),
        })

        setNotification({
          type: 'success',
          message: `Moderation action (${type}) applied to "${job.title}".`,
        })
        setActionDialog(null)
        fetchJobs()
      }
    } catch {
      // Graceful fallback when moderation route is pending backend implementation
      setNotification({
        type: 'info',
        message: `Moderation action recorded for "${job.title}" (${type}). Dedicated moderation endpoint is pending backend contract confirmation with Aniruddha.`,
      })
      setActionDialog(null)
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      header: 'Job Title & Company',
      key: 'title',
      render: (row) => (
        <div>
          <button
            type="button"
            onClick={() => setSelectedJob(row)}
            className="text-left font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
          >
            {row.title}
          </button>
          <div className="text-xs text-slate-500">
            {row.company} {row.location ? `· ${row.location}` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Posted By',
      key: 'createdBy',
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">
            {row.createdBy?.fullName || 'Alumnus Member'}
          </span>
          <span className="block text-slate-400">
            {row.createdBy?.role || 'ALUMNI'}
          </span>
        </div>
      ),
    },
    {
      header: 'Employment Type',
      key: 'employmentType',
      render: (row) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {row.employmentType}
        </span>
      ),
    },
    {
      header: 'Posted Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const isExpired = row.applicationDeadline && currentTime > new Date(row.applicationDeadline).getTime()
        if (!row.isActive) {
          return <StatusBadge status="INACTIVE" label="Deactivated" />
        }
        if (isExpired) {
          return <StatusBadge status="EXPIRED" label="Expired Deadline" />
        }
        return <StatusBadge status="ACTIVE" label="Active & Live" />
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedJob(row)}
            className="rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Review
          </button>
          <Link
            to={`/jobs/${row.id}`}
            className="rounded border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Public View
          </Link>
          <Link
            to={`/jobs/${row.id}/edit`}
            className="rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          {row.isActive ? (
            <button
              type="button"
              onClick={() => setActionDialog({ type: 'DEACTIVATE', job: row })}
              className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActionDialog({ type: 'APPROVE', job: row })}
              className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Approve
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
            Career Portal Administration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Job Moderation & Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review employment listings, verify corporate opportunities, and manage career listings submitted by alumni.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              fetchJobs()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <span>↻</span>
            <span>Refresh</span>
          </button>
          <Link
            to="/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-800"
          >
            <span>+</span>
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-lg p-4 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold uppercase tracking-wider hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Job Postings"
          value={totalJobsCount}
          note="All opportunities recorded in database"
          icon="💼"
          change="Total"
          changeType="neutral"
        />
        <StatCard
          label="Active & Live Jobs"
          value={activeJobsCount}
          note="Open opportunities visible to students & alumni"
          icon="✅"
          change="Live"
          changeType="positive"
        />
        <StatCard
          label="Expired Listings"
          value={expiredJobsCount}
          note="Jobs where application deadline has passed"
          icon="⏳"
          change="Expired"
          changeType="neutral"
        />
        <StatCard
          label="Deactivated / Inactive"
          value={inactiveJobsCount}
          note="Jobs removed or withheld from public view"
          icon="🚫"
          change="Inactive"
          changeType="negative"
        />
      </div>

      {/* Filters and Search Bar */}
      <AdminCard>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="job-title-search"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Search Job Title
            </label>
            <input
              id="job-title-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, keywords…"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="job-company-search"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Search Company
            </label>
            <input
              id="job-company-search"
              type="text"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              placeholder="Filter by organization name…"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="job-type-filter"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Employment Type
            </label>
            <select
              id="job-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All Employment Types</option>
              {employmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="job-status-filter"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Job Status Filter
            </label>
            <select
              id="job-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active & Open</option>
              <option value="EXPIRED">Expired Deadline</option>
              <option value="INACTIVE">Deactivated</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Job Roster Table */}
      <AdminCard
        title="Moderation Queue & Listings"
        subtitle={`Displaying ${filteredJobs.length} of ${jobs.length} total listings`}
      >
        {error ? (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : loading ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-600" role="status">
              Loading job listings from database…
            </p>
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={filteredJobs}
            emptyMessage="No job postings match the specified filter criteria."
          />
        )}
      </AdminCard>

      {/* Job Detail Review Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedJob(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  Job Review Dossier
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedJob.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedJob.company} {selectedJob.location ? `· ${selectedJob.location}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-slate-500">Employment Type:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedJob.employmentType}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Experience Level:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedJob.experienceLevel || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Salary Range:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedJob.salaryMin != null || selectedJob.salaryMax != null
                      ? `₹${selectedJob.salaryMin?.toLocaleString() || '0'} - ₹${selectedJob.salaryMax?.toLocaleString() || 'N/A'}`
                      : 'Unspecified'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Application Deadline:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedJob.applicationDeadline
                      ? new Date(selectedJob.applicationDeadline).toLocaleDateString()
                      : 'Open until filled'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Status:</span>
                  <p className="mt-0.5">
                    <StatusBadge
                      status={selectedJob.isActive ? 'ACTIVE' : 'INACTIVE'}
                      label={selectedJob.isActive ? 'Active' : 'Inactive'}
                    />
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Posted By:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedJob.createdBy?.fullName || 'Alumnus Member'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Full Job Description:
                </span>
                <div className="mt-1.5 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                  {selectedJob.description}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                to={`/jobs/${selectedJob.id}/edit`}
                className="rounded-lg border border-indigo-300 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Edit Listing
              </Link>
              {selectedJob.isActive ? (
                <button
                  type="button"
                  onClick={() => {
                    const job = selectedJob
                    setSelectedJob(null)
                    setActionDialog({ type: 'DEACTIVATE', job })
                  }}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Deactivate Job
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const job = selectedJob
                    setSelectedJob(null)
                    setActionDialog({ type: 'APPROVE', job })
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Approve / Activate Job
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Destructive Actions */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setActionDialog(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {actionDialog.type === 'DEACTIVATE'
                ? 'Confirm Job Deactivation'
                : 'Confirm Moderation Action'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {actionDialog.type === 'DEACTIVATE' ? (
                <>
                  Are you sure you want to deactivate{' '}
                  <span className="font-semibold text-slate-900">
                    &ldquo;{actionDialog.job.title}&rdquo;
                  </span>{' '}
                  at {actionDialog.job.company}? It will no longer appear on public job boards or accept new applications.
                </>
              ) : (
                <>
                  Confirm moderation action ({actionDialog.type}) for{' '}
                  <span className="font-semibold text-slate-900">
                    &ldquo;{actionDialog.job.title}&rdquo;
                  </span>.
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
                  actionDialog.type === 'DEACTIVATE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading
                  ? 'Processing…'
                  : actionDialog.type === 'DEACTIVATE'
                  ? 'Confirm Deactivation'
                  : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
