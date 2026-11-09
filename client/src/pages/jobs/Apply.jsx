import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

export default function Apply() {
  const { jobId } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (coverLetter.length > 5000) return setError('Cover letter must be under 5000 characters.')
    if (resumeUrl && !/^https?:\/\//.test(resumeUrl)) return setError('Enter a full resume URL starting with https://')
    setSaving(true)
    setError('')
    try {
      await apiRequest(`/jobs/${jobId}/applications`, { method: 'POST', body: JSON.stringify({ coverLetter: coverLetter || null, resumeUrl: resumeUrl || null }) })
      navigate('/applications', { state: { message: 'Application submitted.' } })
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  if (session?.role === 'ADMIN') return <p className="mx-auto max-w-2xl px-6 py-12">Administrators cannot apply for jobs.</p>
  return <section className="mx-auto max-w-2xl px-6 py-12"><Link to={`/jobs/${jobId}`} className="text-indigo-700">← Back to job</Link><h1 className="mt-5 text-3xl font-bold">Apply for this job</h1><form onSubmit={submit} className="mt-8 space-y-5 rounded-xl border bg-white p-6"><label className="block text-sm font-semibold">Cover letter<textarea rows="8" maxLength="5000" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="mt-2 w-full rounded border p-3" /></label><label className="block text-sm font-semibold">Resume URL<input type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className="mt-2 w-full rounded border p-3" /></label>{error && <p role="alert" className="text-red-700">{error}</p>}<button disabled={saving} className="rounded bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Submitting…' : 'Submit application'}</button></form></section>
}
