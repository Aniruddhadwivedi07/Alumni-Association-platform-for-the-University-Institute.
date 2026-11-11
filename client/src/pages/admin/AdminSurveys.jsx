import { useEffect, useState, useMemo } from 'react'
import { AdminCard, StatCard } from '../../components/admin/AdminCard'
import { AdminTable, StatusBadge } from '../../components/admin/AdminTable'
import { apiRequest } from '../../lib/api'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Initial institutional survey campaigns
const INITIAL_SURVEYS = [
  {
    id: 1,
    title: 'Alumni Employment & Higher Studies Survey 2026',
    description: 'Collecting employment outcomes, starting compensations, and graduate school admissions data for NIRF accreditation.',
    status: 'ACTIVE',
    responseCount: 142,
    createdAt: '2026-10-15T00:00:00.000Z',
    deadline: '2026-12-31T23:59:59.000Z',
  },
  {
    id: 2,
    title: 'Mentorship Program Feedback & Impact Evaluation',
    description: 'Feedback questionnaire for graduating students and alumni mentors on session quality and skill development.',
    status: 'ACTIVE',
    responseCount: 88,
    createdAt: '2026-11-01T00:00:00.000Z',
    deadline: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 3,
    title: 'Curriculum Revision Alumni Industry Advisory Survey',
    description: 'Seeking alumni recommendations on emerging industry technologies for Computer Science & IT syllabus updates.',
    status: 'COMPLETED',
    responseCount: 204,
    createdAt: '2026-08-10T00:00:00.000Z',
    deadline: '2026-09-30T23:59:59.000Z',
  },
]

// Feedback responses submitted by users
const INITIAL_FEEDBACK = [
  {
    id: 101,
    category: 'EVENTS',
    subject: 'Request for Regional Alumni Chapter in Mumbai',
    rating: 5,
    message: 'We have over 150 alumni working in Mumbai and Pune. Having a regional coordinator would boost alumni attendance substantially.',
    user: 'Rohan Sharma (Class of 2018)',
    email: 'rohan.s@alumni.gec.edu',
    status: 'RESOLVED',
    createdAt: '2026-11-08T10:15:00.000Z',
  },
  {
    id: 102,
    category: 'MENTORSHIP',
    subject: 'More Mock Interview Slots for Pre-Final Years',
    rating: 4,
    message: 'Students would benefit from having mock tech interview sessions before the placement season kicks off in August.',
    user: 'Pooja Nair (Class of 2024)',
    email: 'pooja.n@alumni.gec.edu',
    status: 'PENDING',
    createdAt: '2026-11-10T14:30:00.000Z',
  },
  {
    id: 103,
    category: 'WEBSITE',
    subject: 'Donation Receipt PDF Generation Issue with Firefox',
    rating: 3,
    message: 'The receipt download popup was blocked on Firefox mobile until popup blockers were disabled.',
    user: 'Amitabh Sen (Class of 2012)',
    email: 'amitabh.sen@alumni.gec.edu',
    status: 'REVIEW',
    createdAt: '2026-11-11T09:20:00.000Z',
  },
]

export default function AdminSurveys() {
  const [activeTab, setActiveTab] = useState('surveys') // 'surveys' | 'feedback'
  const [surveys, setSurveys] = useState(INITIAL_SURVEYS)
  const [feedbackList, setFeedbackList] = useState(INITIAL_FEEDBACK)
  const [loading, setLoading] = useState(true)

  // Modals & Actions
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  const [surveyForm, setSurveyForm] = useState({ title: '', description: '', deadline: '' })
  const [surveyErrors, setSurveyErrors] = useState({})
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [notification, setNotification] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    let ignore = false
    apiRequest('/feedback')
      .then((res) => {
        if (!ignore && res.data && res.data.length > 0) {
          setFeedbackList(res.data)
        }
      })
      .catch(() => {
        // Fallback gracefully to institutional feedback data
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // Derived stats
  const activeSurveysCount = surveys.filter((s) => s.status === 'ACTIVE').length
  const totalResponsesCount = surveys.reduce((acc, s) => acc + (s.responseCount || 0), 0)
  const pendingFeedbackCount = feedbackList.filter((f) => f.status === 'PENDING').length
  const resolvedFeedbackCount = feedbackList.filter((f) => f.status === 'RESOLVED').length

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((f) => {
      const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter
      const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter
      const matchesSearch =
        !search ||
        f.subject.toLowerCase().includes(search.toLowerCase()) ||
        f.user.toLowerCase().includes(search.toLowerCase()) ||
        f.message.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [feedbackList, categoryFilter, statusFilter, search])

  // Create new survey
  function handleCreateSurvey(e) {
    e.preventDefault()
    const errs = {}
    if (!surveyForm.title.trim()) errs.title = 'Title is required.'
    if (!surveyForm.description.trim()) errs.description = 'Description is required.'
    if (Object.keys(errs).length > 0) {
      setSurveyErrors(errs)
      return
    }

    const newSurvey = {
      id: surveys.length + 1,
      title: surveyForm.title.trim(),
      description: surveyForm.description.trim(),
      status: 'ACTIVE',
      responseCount: 0,
      createdAt: new Date().toISOString(),
      deadline: surveyForm.deadline ? `${surveyForm.deadline}T23:59:59.000Z` : null,
    }

    setSurveys((prev) => [newSurvey, ...prev])
    setShowSurveyModal(false)
    setSurveyForm({ title: '', description: '', deadline: '' })
    setSurveyErrors({})
    setNotification({ type: 'success', message: `Survey "${newSurvey.title}" created successfully.` })
  }

  // Update feedback status
  function updateFeedbackStatus(id, newStatus) {
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    )
    setSelectedFeedback((prev) => (prev ? { ...prev, status: newStatus } : null))
    setNotification({ type: 'success', message: `Feedback status updated to ${newStatus}.` })
  }

  // Survey columns
  const surveyColumns = [
    {
      key: 'title',
      header: 'Survey Title',
      cellClassName: 'font-medium text-slate-900',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.title}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'responseCount',
      header: 'Responses',
      render: (row) => <span className="font-bold text-slate-800">{row.responseCount}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (row) => fmtDate(row.createdAt),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (row) => fmtDate(row.deadline),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status === 'ACTIVE' ? 'ACTIVE' : 'RESOLVED'}
          label={row.status}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedSurvey(row)}
          className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
        >
          View Details
        </button>
      ),
    },
  ]

  // Feedback columns
  const feedbackColumns = [
    {
      key: 'subject',
      header: 'Subject & Category',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900 line-clamp-1">{row.subject}</p>
          <span className="text-[10px] uppercase font-semibold text-slate-400">{row.category} · {row.rating} ★</span>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Submitted By',
      render: (row) => (
        <div>
          <p className="text-slate-800 font-medium">{row.user}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => fmtDate(row.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status}
          label={row.status}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedFeedback(row)}
          className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
        >
          Review
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Feedback & Surveys Administration</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Create institutional surveys, analyze student/alumni outcomes, and process feedback tickets.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSurveyModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          + Create Survey
        </button>
      </div>

      {notification && (
        <div
          role="alert"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notification.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active Surveys" value={activeSurveysCount} icon="📋" changeType="positive" />
        <StatCard label="Total Responses" value={totalResponsesCount} icon="📊" changeType="neutral" />
        <StatCard label="Pending Feedback" value={pendingFeedbackCount} icon="⏳" changeType="neutral" />
        <StatCard label="Resolved Tickets" value={resolvedFeedbackCount} icon="✅" changeType="positive" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('surveys')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'surveys'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Institutional Surveys ({surveys.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'feedback'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          User Feedback Tickets ({feedbackList.length})
        </button>
      </div>

      {/* Surveys Tab */}
      {activeTab === 'surveys' && (
        <AdminCard
          title="Survey Questionnaires"
          subtitle="Surveys published to alumni and graduating cohorts."
        >
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading surveys…</div>
          ) : (
            <AdminTable
              columns={surveyColumns}
              data={surveys}
              emptyMessage="No surveys created yet."
            />
          )}
        </AdminCard>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <AdminCard
          title="Feedback & Suggestions Tickets"
          subtitle="User-submitted suggestions, bug reports, and program evaluations."
        >
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by subject, user, or keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="EVENTS">Events</option>
              <option value="MENTORSHIP">Mentorship</option>
              <option value="WEBSITE">Platform & Tech</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEW">Review</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <AdminTable
            columns={feedbackColumns}
            data={filteredFeedback}
            emptyMessage="No feedback tickets matching the filters."
          />
        </AdminCard>
      )}

      {/* Create Survey Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowSurveyModal(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Create New Alumni Survey</h3>
            <form onSubmit={handleCreateSurvey} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Survey Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  placeholder="e.g. 2026 NIRF Graduate Employment Survey"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                />
                {surveyErrors.title && <p className="mt-1 text-xs text-rose-600">{surveyErrors.title}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Description & Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={surveyForm.description}
                  onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                  placeholder="Outline purpose and instructions for respondents…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none resize-none"
                />
                {surveyErrors.description && <p className="mt-1 text-xs text-rose-600">{surveyErrors.description}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Submission Deadline</label>
                <input
                  type="date"
                  value={surveyForm.deadline}
                  onChange={(e) => setSurveyForm({ ...surveyForm, deadline: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Publish Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Review Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedFeedback(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {selectedFeedback.category} · {selectedFeedback.rating} ★
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedFeedback.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>By: <strong className="text-slate-700">{selectedFeedback.user}</strong> ({selectedFeedback.email})</span>
                <span>{fmtDate(selectedFeedback.createdAt)}</span>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                {selectedFeedback.message}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-600">Current Status:</span>
                <StatusBadge status={selectedFeedback.status} label={selectedFeedback.status} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedFeedback.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => updateFeedbackStatus(selectedFeedback.id, 'RESOLVED')}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Mark as Resolved
                </button>
              )}
              {selectedFeedback.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => updateFeedbackStatus(selectedFeedback.id, 'REVIEW')}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Mark Under Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Survey Details Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedSurvey(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{selectedSurvey.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedSurvey(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p className="text-slate-600">{selectedSurvey.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Total Responses</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedSurvey.responseCount}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge
                      status={selectedSurvey.status === 'ACTIVE' ? 'ACTIVE' : 'RESOLVED'}
                      label={selectedSurvey.status}
                    />
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Created Date</span>
                  <p className="text-slate-700 mt-0.5">{fmtDate(selectedSurvey.createdAt)}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Deadline</span>
                  <p className="text-slate-700 mt-0.5">{fmtDate(selectedSurvey.deadline)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSurvey(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
