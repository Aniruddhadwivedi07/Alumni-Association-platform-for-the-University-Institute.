import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (!password) return setError('Enter your password.')
    setLoading(true)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname || '/profile', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
        {location.state?.message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{location.state.message}</p>}
        <form onSubmit={submit} className="mt-8 space-y-5">
          <FormField name="email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <FormField name="password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-sm text-slate-600">New to the community? <Link to="/register" className="font-semibold text-indigo-700 hover:underline">Register</Link></p>
      </div>
    </section>
  )
}
