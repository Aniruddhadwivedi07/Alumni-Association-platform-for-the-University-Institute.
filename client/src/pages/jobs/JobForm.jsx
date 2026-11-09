import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

const emptyJob = { title: '', description: '', company: '', location: '', employmentType: '', experienceLevel: '', salaryMin: '', salaryMax: '', applicationDeadline: '' }
const labels = { title: 'Job title', description: 'Description', company: 'Company', location: 'Location', employmentType: 'Employment type', experienceLevel: 'Experience level', salaryMin: 'Minimum salary', salaryMax: 'Maximum salary', applicationDeadline: 'Application deadline' }

export default function JobForm() {
  const { jobId } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(emptyJob)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const allowed = session?.role === 'ALUMNI' || session?.role === 'ADMIN'

  useEffect(() => {
    if (jobId) apiRequest(`/jobs/${jobId}`).then((result) => setJob({ ...emptyJob, ...result.data, applicationDeadline: result.data.applicationDeadline?.slice(0, 10) || '' })).catch((err) => setError(err.message))
  }, [jobId])

  async function submit(event) {
    event.preventDefault()
    if (!job.title.trim() || !job.description.trim() || !job.company.trim() || !job.employmentType.trim()) return setError('Complete the required fields.')
    if (job.salaryMin && job.salaryMax && Number(job.salaryMin) > Number(job.salaryMax)) return setError('Minimum salary cannot exceed maximum salary.')
    const data = { title: job.title, description: job.description, company: job.company, employmentType: job.employmentType, location: job.location || null, experienceLevel: job.experienceLevel || null, salaryMin: job.salaryMin ? Number(job.salaryMin) : null, salaryMax: job.salaryMax ? Number(job.salaryMax) : null, applicationDeadline: job.applicationDeadline || null }
    setSaving(true)
    setError('')
    try {
      const result = await apiRequest(jobId ? `/jobs/${jobId}` : '/jobs', { method: jobId ? 'PUT' : 'POST', body: JSON.stringify(data) })
      navigate(`/jobs/${result.data.id}`)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  if (!allowed) return <p className="mx-auto max-w-3xl px-6 py-12">Only alumni and administrators can post jobs. <Link to="/jobs" className="text-indigo-700">Browse jobs</Link></p>
  if (jobId && session.role !== 'ADMIN' && job.createdById && job.createdById !== session.id) return <p className="mx-auto max-w-3xl px-6 py-12">You can edit only your own jobs.</p>

  return <section className="mx-auto max-w-3xl px-6 py-12"><h1 className="text-3xl font-bold">{jobId ? 'Edit job' : 'Post a job'}</h1><form onSubmit={submit} className="mt-8 space-y-5 rounded-xl border bg-white p-6">{Object.keys(labels).map((name) => <label key={name} className="block text-sm font-semibold">{labels[name]}{['title', 'description', 'company', 'employmentType'].includes(name) ? ' *' : ''}{name === 'description' ? <textarea name={name} rows="6" value={job[name] || ''} onChange={(event) => setJob({ ...job, [name]: event.target.value })} className="mt-2 w-full rounded border p-3" /> : <input name={name} type={name === 'applicationDeadline' ? 'date' : name.startsWith('salary') ? 'number' : 'text'} min={name.startsWith('salary') ? 0 : undefined} value={job[name] || ''} onChange={(event) => setJob({ ...job, [name]: event.target.value })} className="mt-2 w-full rounded border p-3" />}</label>)}{error && <p role="alert" className="text-red-700">{error}</p>}<button disabled={saving} className="rounded bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : jobId ? 'Save job' : 'Post job'}</button></form></section>
}
