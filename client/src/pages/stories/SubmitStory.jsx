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
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!title.trim()) {
      setError('Story title is required.')
      return
    }

    if (!content.trim() || content.trim().length < 50) {
      setError('Please provide at least 50 characters detailing your story.')
      return
    }

    setSubmitting(true)
    try {
      await apiRequest('/success-stories', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl.trim() || undefined
        })
      })
      setMessage('Your success story has been submitted successfully! It will be reviewed by the Alumni Council before public feature.')
      setTitle('')
      setContent('')
      setImageUrl('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (session?.role !== 'ALUMNI') {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-2xl text-[#0878D1]">
            🎓
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#172B45]">Alumni Access Required</h2>
          <p className="mt-2 text-sm text-slate-600">
            Success story submissions are exclusively reserved for verified alumni accounts.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/stories"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Browse Stories
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-[#0878D1] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0665B2] transition"
            >
              Log In as Alumni
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <Link
          to="/stories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0878D1] hover:underline"
        >
          ← Back to Stories
        </Link>
      </div>

      <div className="mt-6">
        <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
          Share Your Journey
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45]">
          Submit Your Success Story
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Share your career milestones, startup experiences, technical breakthroughs, or life lessons with the alumni community.
        </p>
      </div>

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <p className="font-semibold">✓ Story Submitted</p>
          <p className="mt-1">{message}</p>
          <Link to="/stories" className="mt-3 inline-block font-semibold text-emerald-700 hover:underline">
            View All Stories →
          </Link>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Story Headline / Title <span className="text-rose-500">*</span>
          </label>
          <input
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. From Student Project to Series A Startup Founder"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Full Narrative / Your Story <span className="text-rose-500">*</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Detail your journey, key challenges overcome, decisions made, and takeaways for current students and peers.
          </p>
          <textarea
            required
            maxLength={10000}
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story here…"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {content.length} / 10000 characters
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Cover / Featured Image URL (Optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/stories"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#0878D1] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Story for Review'}
          </button>
        </div>
      </form>
    </section>
  )
}
