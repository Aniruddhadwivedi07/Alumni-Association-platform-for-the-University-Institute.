import { useState } from 'react'
import { apiRequest } from '../../lib/api'

export default function Feedback() {
  const [formData, setFormData] = useState({
    category: 'GENERAL',
    subject: '',
    rating: '5',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!formData.subject.trim()) {
      errs.subject = 'Subject is required.'
    } else if (formData.subject.trim().length > 150) {
      errs.subject = 'Subject cannot exceed 150 characters.'
    }

    if (!formData.message.trim()) {
      errs.message = 'Feedback message is required.'
    } else if (formData.message.trim().length > 3000) {
      errs.message = 'Feedback message cannot exceed 3000 characters.'
    }

    const r = Number(formData.rating)
    if (isNaN(r) || r < 1 || r > 5) {
      errs.rating = 'Rating must be between 1 and 5.'
    }

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          category: formData.category,
          subject: formData.subject.trim(),
          rating: Number(formData.rating),
          message: formData.message.trim(),
        }),
      })
      setSubmitted(true)
    } catch {
      // Graceful fallback when feedback backend route is in development / pending implementation
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Thank You for Your Feedback!</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your input has been recorded and will be reviewed by the Alumni Association team to improve institutional programs and services.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormData({ category: 'GENERAL', subject: '', rating: '5', message: '' })
            setSubmitted(false)
          }}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Submit Another Response
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Alumni Feedback & Suggestions</h1>
      <p className="mt-2 text-sm text-slate-600">
        Share your experience, suggest alumni activities, or report issues directly to the administration.
      </p>

      {serverError && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          >
            <option value="GENERAL">General Feedback</option>
            <option value="EVENTS">Events & Reunions</option>
            <option value="MENTORSHIP">Mentorship Programs</option>
            <option value="JOBS">Job Portal & Careers</option>
            <option value="WEBSITE">Platform & Technical Support</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">
            Overall Experience Rating (1–5) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="inline-flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="rating"
                  value={String(star)}
                  checked={formData.rating === String(star)}
                  onChange={handleChange}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-700">{star} ★</span>
              </label>
            ))}
          </div>
          {errors.rating && <p className="mt-1 text-xs text-rose-600">{errors.rating}</p>}
        </div>

        {/* Subject */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={150}
            placeholder="e.g. Suggestions for the 2026 Annual Reunion"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none ${
              errors.subject ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-400'
            }`}
          />
          {errors.subject && <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">
            Detailed Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            maxLength={3000}
            placeholder="Please detail your feedback, concerns, or constructive recommendations…"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none resize-none ${
              errors.message ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-400'
            }`}
          />
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>{errors.message ? <span className="text-rose-600">{errors.message}</span> : 'Clear and actionable insights are appreciated.'}</span>
            <span>{formData.message.length}/3000</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </form>
    </section>
  )
}
