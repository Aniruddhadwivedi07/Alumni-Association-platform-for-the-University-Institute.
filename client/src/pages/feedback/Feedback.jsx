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
      await apiRequest('/surveys/feedback', {
        method: 'POST',
        body: JSON.stringify({
          category: formData.category,
          subject: formData.subject.trim(),
          rating: Number(formData.rating),
          message: formData.message.trim(),
        }),
      })
      setSubmitted(true)
    } catch (err) {
      setServerError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#172B45]">Thank You for Your Feedback!</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your insights have been recorded and forwarded to the NST Alumni Relations and Academic Council. Constructive feedback helps us continuously improve community programs.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false)
              setFormData({ category: 'GENERAL', subject: '', rating: '5', message: '' })
            }}
            className="mt-6 rounded-xl bg-[#0878D1] px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#0665B2]"
          >
            Submit Another Response
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
          NST Community Voice
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45]">
          Community Feedback
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Share your suggestions, feature requests, and campus thoughts with the Newton School of Technology Alumni Council.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8" noValidate>
        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          >
            <option value="GENERAL">General Platform & Experience</option>
            <option value="CURRICULUM">Curriculum & Technical Upskilling</option>
            <option value="CAMPUS">Campus Facilities & Labs</option>
            <option value="CAREERS">Placement & Alumni Referrals</option>
            <option value="MENTORSHIP">Mentorship Program</option>
            <option value="EVENTS">Reunions & Hackathons</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Overall Experience Rating (1 = Poor, 5 = Excellent)
          </label>
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
          >
            <option value="5">⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
            <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
            <option value="3">⭐⭐⭐ (3 - Good)</option>
            <option value="2">⭐⭐ (2 - Needs Improvement)</option>
            <option value="1">⭐ (1 - Unsatisfactory)</option>
          </select>
          {errors.rating && <p className="mt-1 text-xs text-rose-600">{errors.rating}</p>}
        </div>

        {/* Subject */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={150}
            placeholder="e.g. Suggestions for the 2026 NST Tech Meetup"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF] ${
              errors.subject ? 'border-rose-400' : 'border-slate-300'
            }`}
          />
          {errors.subject && <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Detailed Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            maxLength={3000}
            placeholder="Please detail your feedback, recommendations, or questions…"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 outline-none transition resize-none focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF] ${
              errors.message ? 'border-rose-400' : 'border-slate-300'
            }`}
          />
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>{errors.message ? <span className="text-rose-600">{errors.message}</span> : 'Clear and constructive insights are appreciated.'}</span>
            <span>{formData.message.length}/3000</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#0878D1] py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2] disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </form>
    </section>
  )
}
