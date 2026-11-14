import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminHeader({ onOpenMobile }) {
  const { session, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <span className="text-xl">☰</span>
        </button>
        <div>
          <span className="rounded bg-[#EAF2FF] px-2 py-0.5 text-xs font-semibold text-[#0878D1]">
            NST Portal
          </span>
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
            Alumni Administration Workspace
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/"
          className="text-xs font-medium text-slate-600 hover:text-[#0878D1] sm:text-sm"
        >
          ← Public Site
        </Link>
        <div className="hidden h-5 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-800">
              {session?.profile?.fullName || session?.email || 'Administrator'}
            </p>
            <p className="text-xs text-slate-500">Newton School of Technology • {session?.role || 'ADMIN'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
