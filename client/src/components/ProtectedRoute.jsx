import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="mx-auto max-w-6xl px-6 py-16">Checking your session…</p>
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
