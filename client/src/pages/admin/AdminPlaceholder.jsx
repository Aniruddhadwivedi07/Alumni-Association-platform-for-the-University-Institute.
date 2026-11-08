import { Link } from 'react-router-dom'
import { AdminCard } from '../../components/admin/AdminCard'

export default function AdminPlaceholder({ title, description, moduleKey }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
          Module Workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      <AdminCard>
        <div className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            ⚙️
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {title} Management Module
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            This module navigation is configured in the admin dashboard layout. The management interface and API integrations for <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700">{moduleKey}</code> will attach to this route once backend endpoints are available.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/admin"
              className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
            >
              Back to Overview
            </Link>
            <Link
              to="/admin/verification"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go to Verification
            </Link>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}
