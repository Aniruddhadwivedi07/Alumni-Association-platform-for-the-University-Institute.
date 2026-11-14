import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.'
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters.'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 600)
  }

  return (
    <>
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#064477] to-[#002D54] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">
            Newton School of Technology
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Contact the NST Alumni Cell
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-sky-100">
            Have questions about alumni membership, cohort reunions, mentorship, or campus initiatives? Reach out to our team.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Institutional Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-[#172B45]">Get in Touch</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              The NST Alumni Relations Cell is located on the college campus. We are available during academic working hours to assist alumni, students, and technology partners.
            </p>

            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 shadow-xs">
                <h3 className="font-bold text-[#172B45]">Campus Office</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Newton School of Technology Campus<br />
                  Alumni Relations & External Partnerships Wing<br />
                  Tech Tower, Innovation Floor<br />
                  <span className="font-medium text-[#0878D1]">alumni@newtonschool.co</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 shadow-xs">
                <h3 className="font-bold text-[#172B45]">Inquiry Types Handled</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Alumni registration verification and cohort records</li>
                  <li>• Mentorship program participation</li>
                  <li>• Campus visits, technical masterclasses, and batch meetups</li>
                  <li>• Institutional hackathons and scholarship initiatives</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-[#EAF2FF]/60 p-6">
                <h3 className="font-bold text-[#064477]">Operating Hours</h3>
                <p className="mt-2 text-sm text-slate-700">
                  Monday to Friday: 9:00 AM – 6:00 PM IST<br />
                  Saturday: 10:00 AM – 2:00 PM IST (by appointment)
                </p>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
            <h2 className="text-2xl font-bold text-[#172B45]">Send Us an Inquiry</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill out the form below and an NST alumni relations officer will get back to you.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                <h3 className="font-bold">Thank you for reaching out!</h3>
                <p className="mt-2 text-sm text-emerald-800">
                  Your message has been received by the NST Alumni Relations Cell. We will review your inquiry and respond within two working days.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    aria-invalid={Boolean(errors.name)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0878D1] ${
                      errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Alex Sharma"
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-xs text-rose-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={Boolean(errors.email)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0878D1] ${
                      errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-rose-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">
                    Subject <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                    aria-invalid={Boolean(errors.subject)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0878D1] ${
                      errors.subject ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Mentorship Inquiry / Cohort Reunion"
                  />
                  {errors.subject && (
                    <p id="subject-error" className="mt-1 text-xs text-rose-600">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700">
                    Message <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    aria-invalid={Boolean(errors.message)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0878D1] ${
                      errors.message ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300'
                    }`}
                    placeholder="Write your message here..."
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-xs text-rose-600">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#0878D1] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2] disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
