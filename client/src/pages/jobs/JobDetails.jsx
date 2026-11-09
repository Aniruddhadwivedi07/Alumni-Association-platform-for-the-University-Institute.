import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

export default function JobDetails() {
  const { jobId } = useParams()
  const { session } = useAuth()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    apiRequest(`/jobs/${jobId}`).then((result) => setJob(result.data)).catch((err) => setError(err.message))
  }, [jobId])
  if (error) return <p role="alert" className="mx-auto max-w-3xl px-6 py-12 text-red-700">{error}</p>
  if (!job) return <p className="mx-auto max-w-3xl px-6 py-12">Loading job…</p>
  return <article className="mx-auto max-w-3xl px-6 py-12"><Link to="/jobs" className="text-indigo-700">← All jobs</Link><h1 className="mt-6 text-3xl font-bold">{job.title}</h1><p className="mt-2 text-lg">{job.company}</p><p className="mt-3 text-slate-600">{job.location || 'Location not listed'} · {job.employmentType}</p>{job.experienceLevel && <p className="mt-2">Experience: {job.experienceLevel}</p>}{job.applicationDeadline && <p className="mt-2">Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</p>}<div className="mt-8 whitespace-pre-wrap leading-relaxed">{job.description}</div>{session?.role !== 'ADMIN' && <Link to={`/jobs/${jobId}/apply`} className="mt-8 inline-block rounded bg-indigo-700 px-5 py-3 font-semibold text-white">Apply now</Link>}</article>
}
