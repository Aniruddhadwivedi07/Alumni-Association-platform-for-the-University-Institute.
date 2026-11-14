import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'
import nstLogo from '../../assets/nst-logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!email.trim()) return setError('Email address is required.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')
    if (!password) return setError('Password is required.')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from?.pathname || '/profile', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="inline-block transition-opacity hover:opacity-90">
            <img
              src={nstLogo}
              alt="Newton School of Technology"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <span className="mt-3 inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
            NST Alumni Association
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#172B45] sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your alumni profile & services
          </p>
        </div>

        {location.state?.message && (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {location.state.message}
          </p>
        )}

        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <FormField
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div className="relative">
            <FormField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-xs font-semibold text-slate-500 hover:text-slate-800"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#0878D1] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to the community?{' '}
          <Link to="/register" className="font-semibold text-[#0878D1] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  )
}
