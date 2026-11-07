import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import { apiRequest } from '../../lib/api'
import { EMPTY_PROFILE, validateProfile } from '../../lib/profile'

const maxGraduationYear = new Date().getFullYear() + 8

const fields = [
  ['fullName', 'Full name', 'text'],
  ['email', 'Email address', 'email'],
  ['graduationYear', 'Graduation year', 'number'],
  ['department', 'Department', 'text'],
]

export default function Register() {
  const [values, setValues] = useState({ ...EMPTY_PROFILE, password: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ loading: false, message: '' })
  const navigate = useNavigate()

  function update(event) {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = validateProfile(values, true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setStatus({ loading: true, message: '' })
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName: values.fullName, email: values.email, password: values.password, graduationYear: values.graduationYear ? Number(values.graduationYear) : null, department: values.department || null }),
      })
      navigate('/login', { state: { message: 'Registration complete. You can sign in now.' } })
    } catch (error) {
      setStatus({ loading: false, message: error.message })
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Join the community</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Alumni registration</h1>
        <p className="mt-3 text-slate-600">Create your alumni account and share the details you want in your profile.</p>
        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          {fields.map(([name, label, type]) => (
            <FormField key={name} name={name} label={label} type={type} value={values[name]} onChange={update} error={errors[name]} required={name === 'fullName' || name === 'email'} min={type === 'number' ? 1950 : undefined} max={type === 'number' ? maxGraduationYear : undefined} />
          ))}
          <FormField name="password" label="Password" type="password" autoComplete="new-password" value={values.password} onChange={update} error={errors.password} required />
          {status.message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{status.message}</p>}
          <button disabled={status.loading} className="w-full rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60">
            {status.loading ? 'Submitting…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">Already registered? <Link to="/login" className="font-semibold text-indigo-700 hover:underline">Sign in</Link></p>
      </div>
    </section>
  )
}
