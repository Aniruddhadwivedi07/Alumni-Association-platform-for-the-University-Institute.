import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import FormField from '../../components/FormField'
import { apiRequest } from '../../lib/api'
import { EMPTY_PROFILE, validateProfile } from '../../lib/profile'

const profileFields = [
  ['fullName', 'Full name', 'text'],
  ['graduationYear', 'Graduation / Cohort year', 'number'],
  ['department', 'Department / Specialization', 'text'],
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
        body: JSON.stringify({
          fullName: profile.fullName,
          graduationYear: profile.graduationYear ? Number(profile.graduationYear) : null,
          department: profile.department || null,
          currentJobTitle: profile.currentJobTitle || null,
          currentCompany: profile.currentCompany || null,
          bio: profile.bio || null,
          linkedinUrl: profile.linkedinUrl || null,
        }),
      })
      setProfile({ ...profile, ...data.data?.profile })
      setEditing(false)
      setMessage('Your NST alumni profile has been saved.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-sm text-slate-500">
        Loading your NST profile…
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
              NST Member Profile
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172B45] sm:text-3xl">
              Your Profile
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-700">{session?.role || 'MEMBER'}</span> • Newton School of Technology
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-xl border border-[#0878D1] px-4 py-2 text-xs font-semibold text-[#0878D1] shadow-xs hover:bg-[#EAF2FF] transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <p role="status" className="mt-5 rounded-xl border border-sky-200 bg-[#EAF2FF] p-3 text-sm text-[#064477]">
            {message}
          </p>
        )}

        {editing ? (
          <form onSubmit={save} className="mt-8 space-y-5">
            {profileFields.map(([name, label, type]) => (
              <FormField
                key={name}
                name={name}
                label={label}
                type={type}
                value={profile[name] || ''}
                onChange={update}
                error={errors[name]}
                required={name === 'fullName' || name === 'email'}
              />
            ))}
            <div className="space-y-1.5">
              <label htmlFor="bio" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                About You / Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={profile.bio || ''}
                onChange={update}
                placeholder="Share your engineering focus, interests, and how you want to collaborate with NST peers…"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                disabled={saving}
                className="rounded-xl bg-[#0878D1] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2] disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setErrors({})
                }}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-2xl font-bold text-[#0878D1]">
                {(profile.fullName || session?.email || 'N').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#172B45]">
                  {profile.fullName || session?.user?.fullName || 'Alumni Member'}
                </h2>
                <p className="text-sm font-medium text-slate-600">
                  {profile.currentJobTitle ? profile.currentJobTitle : 'Engineer'}
                  {profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {profile.email || session?.email}
                </p>
              </div>
            </div>

            <dl className="grid gap-4 rounded-xl bg-[#F7F9FC] p-5 border border-slate-100 sm:grid-cols-2">
              {profileFields
                .filter(([name]) => name !== 'fullName')
                .map(([name, label]) => (
                  <div key={name}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {name === 'linkedinUrl' && profile[name] ? (
                        <a
                          href={profile[name]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0878D1] hover:underline"
                        >
                          {profile[name]}
                        </a>
                      ) : (
                        profile[name] || '—'
                      )}
                    </dd>
                  </div>
                ))}
            </dl>

            {profile.bio && (
              <div className="rounded-xl bg-white p-5 border border-slate-200/80">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bio</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
