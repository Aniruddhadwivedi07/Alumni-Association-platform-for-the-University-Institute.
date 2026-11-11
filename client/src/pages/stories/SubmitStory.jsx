import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

export default function SubmitStory() {
  const { session } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await apiRequest('/success-stories', { method: 'POST', body: JSON.stringify({ title, content, imageUrl }) })
      setMessage('Your story was submitted for review.')
      setTitle('')
      setContent('')
      setImageUrl('')
    } catch (err) { setError(err.message) }
  }

  if (session?.role !== 'ALUMNI') return <p className="mx-auto max-w-3xl px-6 py-12">Only alumni can submit stories.</p>
  return <section className="mx-auto max-w-3xl px-6 py-12">
    <Link to="/stories" className="text-indigo-700">← All stories</Link>
    <h1 className="mt-6 text-3xl font-bold">Share your story</h1>
    <form onSubmit={submit} className="mt-8 space-y-5 rounded-xl border bg-white p-6">
      <label className="block font-semibold">Title<input required maxLength="200" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded border p-3" /></label>
      <label className="block font-semibold">Your story<textarea required maxLength="10000" rows="10" value={content} onChange={(event) => setContent(event.target.value)} className="mt-2 w-full rounded border p-3" /></label>
      <label className="block font-semibold">Image URL (optional)<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="mt-2 w-full rounded border p-3" /></label>
      <button className="rounded bg-indigo-700 px-5 py-3 font-semibold text-white">Submit for review</button>
    </form>
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {message && <p role="status" className="mt-4 text-green-700">{message}</p>}
  </section>
}
