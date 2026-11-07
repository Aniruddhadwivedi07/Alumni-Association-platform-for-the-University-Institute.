import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import FormField from '../../components/FormField'
import { apiRequest } from '../../lib/api'
import { EMPTY_PROFILE, validateProfile } from '../../lib/profile'

const profileFields = [
  ['fullName', 'Full name', 'text'],
  ['graduationYear', 'Graduation year', 'number'],
  ['department', 'Department', 'text'],
  ['currentJobTitle', 'Current job title', 'text'],
  ['currentCompany', 'Current company', 'text'],
  ['linkedinUrl', 'LinkedIn profile URL', 'url'],
]

export default function Profile() {
  const { session } = useAuth()
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    apiRequest('/profile/me')
      .then((data) => setProfile({ ...EMPTY_PROFILE, ...data.data?.profile, email: data.data?.email || '' }))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false))
  }, [])

  function update(event) {
    setProfile({ ...profile, [event.target.name]: event.target.value })
  }

  async function save(event) {
    event.preventDefault()
    const nextErrors = validateProfile(profile)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    setMessage('')
    try {
      const data = await apiRequest('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ fullName: profile.fullName, graduationYear: profile.graduationYear ? Number(profile.graduationYear) : null, department: profile.department || null, currentJobTitle: profile.currentJobTitle || null, currentCompany: profile.currentCompany || null, bio: profile.bio || null, linkedinUrl: profile.linkedinUrl || null }),
      })
      setProfile({ ...profile, ...data.data?.profile })
      setEditing(false)
      setMessage('Your profile has been saved.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="mx-auto max-w-3xl px-6 py-16">Loading your profile…</p>

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Alumni account</p>
            <h1 className="mt-2 text-3xl font-bold">Your profile</h1>
          </div>
          {!editing && <button onClick={() => setEditing(true)} className="rounded-lg border border-indigo-700 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-50">Edit profile</button>}
        </div>
        {message && <p role="status" className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
        {editing ? (
          <form onSubmit={save} className="mt-8 space-y-5">
            {profileFields.map(([name, label, type]) => (
              <FormField key={name} name={name} label={label} type={type} value={profile[name] || ''} onChange={update} error={errors[name]} required={name === 'fullName' || name === 'email'} />
            ))}
            <div className="space-y-2">
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-700">About you</label>
              <textarea id="bio" name="bio" rows="4" value={profile.bio || ''} onChange={update} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="flex gap-3">
              <button disabled={saving} className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
              <button type="button" onClick={() => { setEditing(false); setErrors({}) }} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-5">
            <h2 className="text-2xl font-bold">{profile.fullName || session?.user?.fullName || 'Alumni member'}</h2>
            <p className="text-slate-600">{profile.currentJobTitle}{profile.currentCompany ? ` at ${profile.currentCompany}` : ''}</p>
            <dl className="grid gap-4 sm:grid-cols-2">
              {profileFields.filter(([name]) => name !== 'fullName').map(([name, label]) => (
                <div key={name}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-medium">{profile[name] || 'Not provided'}</dd></div>
              ))}
            </dl>
            {profile.bio && <p className="leading-relaxed text-slate-700">{profile.bio}</p>}
          </div>
        )}
      </div>
    </section>
  )
}
