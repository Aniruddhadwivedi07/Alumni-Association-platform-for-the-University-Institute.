import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Verifying administrator authorization…</p>
      </div>
    )
  }

  // Not logged in -> redirect to login preserving intent
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Role check: Only ADMIN role can access admin portal
  if (session.role !== 'ADMIN') {
    return (
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl text-rose-600">
          ⛔
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your current account role (<span className="font-semibold">{session.role || 'GUEST'}</span>) does not have administrative permissions required to access the Admin Console.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/"
            className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
          >
            Return to Homepage
          </a>
          <a
            href="/profile"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Your Profile
          </a>
        </div>
      </section>
    )
  }

  return <Outlet />
}
