import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminCard, StatCard } from '../../components/admin/AdminCard'
import { AdminTable, StatusBadge } from '../../components/admin/AdminTable'
import { apiRequest } from '../../lib/api'

export default function AdminDashboard() {
  const [directoryStats, setDirectoryStats] = useState({ total: 0, loading: true })
  const [recentAlumni, setRecentAlumni] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch live directory counts and recent records from existing /api/directory/alumni
    apiRequest('/directory/alumni?limit=5&sortBy=createdAt&sortOrder=desc')
      .then((res) => {
        setDirectoryStats({
          total: res.pagination?.totalRecords ?? 0,
          loading: false,
        })
        setRecentAlumni(res.data || [])
      })
      .catch((err) => {
        setError(err.message)
        setDirectoryStats((prev) => ({ ...prev, loading: false }))
      })
  }, [])

  const columns = [
    {
      header: 'Alumnus',
      key: 'fullName',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.fullName}</div>
          <div className="text-xs text-slate-500">{row.department || 'No department listed'}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (row) => <StatusBadge status={row.role || 'ALUMNI'} />,
    },
    {
      header: 'Graduation Year',
      key: 'graduationYear',
      render: (row) => row.graduationYear || '—',
    },
    {
      header: 'Company / Role',
      key: 'currentCompany',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.currentJobTitle ? `${row.currentJobTitle}` : ''}
          {row.currentCompany ? ` @ ${row.currentCompany}` : (!row.currentJobTitle ? '—' : '')}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'actions',
      render: () => (
        <Link
          to="/admin/verification"
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
        >
          View in Verification
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
            Administration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time status of alumni community records and administrative actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800"
          >
            <span>Review Registrations</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Active Alumni"
          value={directoryStats.loading ? '…' : directoryStats.total}
          note="Live count from verified directory"
          icon="🎓"
          change="Live DB"
          changeType="positive"
        />
        <StatCard
          label="Pending Verification"
          value="Needs Review"
          note="Incoming alumni awaiting validation"
          icon="⏳"
          change="Action required"
          changeType="negative"
        />
        <StatCard
          label="Active Programs"
          value="10 Modules"
          note="Directory, Mentorship, Events & Jobs"
          icon="🧭"
          change="Configured"
          changeType="neutral"
        />
        <StatCard
          label="System Status"
          value="Healthy"
          note="Database & API operational"
          icon="🛡️"
          change="Online"
          changeType="positive"
        />
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          title="Alumni Verification"
          subtitle="Review incoming alumni registration requests"
        >
          <p className="text-sm text-slate-600 mb-4">
            Inspect pending alumni applicant profiles, verify institutional credentials, and approve or reject submissions.
          </p>
          <Link
            to="/admin/verification"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Launch verification workflow →
          </Link>
        </AdminCard>

        <AdminCard
          title="Directory Management"
          subtitle="Search & browse complete alumni roster"
        >
          <p className="text-sm text-slate-600 mb-4">
            Access indexed records, view career milestones, and monitor cohort representation across graduation years.
          </p>
          <Link
            to="/directory"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Browse live directory →
          </Link>
        </AdminCard>

        <AdminCard
          title="Platform Governance"
          subtitle="Role-based access & system security"
        >
          <p className="text-sm text-slate-600 mb-4">
            Security controls enforce strict RBAC across Student, Alumni, and Administrator role tiers.
          </p>
          <Link
            to="/admin/users"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            View user management →
          </Link>
        </AdminCard>
      </div>

      {/* Recent Directory Activity Table */}
      <AdminCard
        title="Recent Verified Directory Members"
        subtitle="Latest alumni records active in the database"
        action={
          <Link
            to="/directory"
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
          >
            View all directory members →
          </Link>
        }
      >
        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : directoryStats.loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading directory records…</p>
        ) : (
          <AdminTable
            columns={columns}
            data={recentAlumni}
            emptyMessage="No verified alumni found in database yet."
          />
        )}
      </AdminCard>
    </div>
  )
}
