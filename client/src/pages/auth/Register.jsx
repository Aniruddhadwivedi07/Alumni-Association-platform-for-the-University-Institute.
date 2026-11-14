import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import { apiRequest } from '../../lib/api'
import { EMPTY_PROFILE, validateProfile } from '../../lib/profile'
import nstLogo from '../../assets/nst-logo.png'

const maxGraduationYear = new Date().getFullYear() + 8

const fields = [
  ['fullName', 'Full name', 'text'],
  ['email', 'Email address', 'email'],
  ['graduationYear', 'Graduation year', 'number'],
  ['department', 'Department / Specialization', 'text'],
]

export default function Register() {
  const [values, setValues] = useState({ ...EMPTY_PROFILE, password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ loading: false, message: '' })
  const navigate = useNavigate()

  function update(event) {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = validateProfile(values, true)
    if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setStatus({ loading: true, message: '' })
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          graduationYear: values.graduationYear ? Number(values.graduationYear) : null,
          department: values.department ? values.department.trim() : null,
        }),
      })
      navigate('/login', { state: { message: 'Registration complete. You can sign in now.' } })
    } catch (error) {
      setStatus({ loading: false, message: error.message })
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
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
            Alumni Registration
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create your account to connect with peers, discover jobs, and mentor students
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          {fields.map(([name, label, type]) => (
            <FormField
              key={name}
              name={name}
              label={label}
              type={type}
              value={values[name]}
              onChange={update}
              error={errors[name]}
              required={name === 'fullName' || name === 'email'}
              min={type === 'number' ? 1950 : undefined}
              max={type === 'number' ? maxGraduationYear : undefined}
            />
          ))}
          <FormField
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={update}
            error={errors.password}
            required
          />
          <FormField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={update}
            error={errors.confirmPassword}
            required
          />
          {status.message && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {status.message}
            </p>
          )}
          <button
            disabled={status.loading}
            className="w-full rounded-xl bg-[#0878D1] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2] disabled:opacity-60"
          >
            {status.loading ? 'Submitting…' : 'Create Alumni Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#0878D1] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
