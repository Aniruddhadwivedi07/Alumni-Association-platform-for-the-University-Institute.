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

// Initial curated alumni success stories
const INITIAL_STORIES = [
  {
    id: 's-101',
    title: 'From Campus Lab to Series A Startup Founder',
    content: 'A deep dive into how our collegiate robotics laboratory fostered the core vision behind RoboScale, an autonomous warehouse solutions company that recently closed an $8M Series A funding round.',
    author: 'Priya Sundaram',
    graduationYear: 2017,
    department: 'Mechanical Engineering',
    category: 'Entrepreneurship',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    status: 'APPROVED',
    isPublished: true,
    submittedAt: '2026-10-20T11:00:00.000Z',
    publishedAt: '2026-10-22T09:30:00.000Z',
  },
  {
    id: 's-102',
    title: 'Pioneering Quantum Computing Research at CERN',
    content: 'After completing my B.Tech in Electronics, I transitioned into quantum information systems. Here are the core insights and research methodologies acquired during my time at the institute that propelled my journey.',
    author: 'Dr. Vikramaditya Sen',
    graduationYear: 2014,
    department: 'Electronics & Communication',
    category: 'Research & Academics',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    status: 'APPROVED',
    isPublished: true,
    submittedAt: '2026-11-01T15:20:00.000Z',
    publishedAt: '2026-11-03T10:00:00.000Z',
  },
  {
    id: 's-103',
    title: 'Building Inclusive Open-Source DevTools for Millions',
    content: 'Reflecting on ten years in open-source software engineering, contributing to major distributed system frameworks, and mentoring the next generation of college developers.',
    author: 'Neha Deshmukh',
    graduationYear: 2020,
    department: 'Computer Science',
    category: 'Engineering & Technology',
    imageUrl: null,
    status: 'PENDING',
    isPublished: false,
    submittedAt: '2026-11-10T16:45:00.000Z',
    publishedAt: null,
  },
  {
    id: 's-104',
    title: 'Leading Renewable Energy Grids in Rural India',
    content: 'How microgrid engineering and sustainable power distribution projects implemented in rural Maharashtra are transforming agricultural productivity.',
    author: 'Karan Patel',
    graduationYear: 2016,
    department: 'Electrical Engineering',
    category: 'Social Impact',
    imageUrl: null,
    status: 'PENDING',
    isPublished: false,
    submittedAt: '2026-11-11T08:15:00.000Z',
    publishedAt: null,
  },
]

export default function AdminStories() {
  const [stories, setStories] = useState(INITIAL_STORIES)
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState(null)
  const [actionDialog, setActionDialog] = useState(null) // { type: 'APPROVE' | 'REJECT', story: object }
  const [notification, setNotification] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Search & Filter
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    let ignore = false
    apiRequest('/admin/success-stories?limit=50')
      .then((res) => {
        if (!ignore && res.data && res.data.length > 0) {
          const apiStories = res.data.map((s) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            author: s.author?.fullName || s.author?.email || 'Alumni member',
            graduationYear: s.author?.graduationYear,
            department: s.author?.department,
            category: 'Engineering & Technology',
            imageUrl: s.imageUrl,
            status: s.isPublished ? 'APPROVED' : 'PENDING',
            isPublished: s.isPublished,
            submittedAt: s.createdAt,
            publishedAt: s.publishedAt,
          }))

          setStories(apiStories)
        }
      })
      .catch(() => {
        // Fallback gracefully to curated local queue if offline
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // KPI Calculations
  const totalCount = stories.length
  const pendingCount = stories.filter((s) => s.status === 'PENDING').length
  const approvedCount = stories.filter((s) => s.status === 'APPROVED').length
  const rejectedCount = stories.filter((s) => s.status === 'REJECTED').length

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
      const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.author.toLowerCase().includes(search.toLowerCase()) ||
        s.content.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [stories, statusFilter, categoryFilter, search])

  // Handle Moderation Confirmation Action
  async function handleConfirmModeration() {
    if (!actionDialog) return
    const { type, story } = actionDialog

    try {
      if (type === 'APPROVE') {
        await apiRequest(`/admin/success-stories/${story.id}/publish`, {
          method: 'PATCH',
        })
      } else if (type === 'REJECT') {
        await apiRequest(`/admin/success-stories/${story.id}/unpublish`, {
          method: 'PATCH',
        })
      }
    } catch {
      // Graceful fallback for offline demo environment
    }

    setStories((prev) =>
      prev.map((item) => {
        if (item.id === story.id) {
          if (type === 'APPROVE') {
            return {
              ...item,
              status: 'APPROVED',
              isPublished: true,
              publishedAt: new Date().toISOString(),
            }
          }
          if (type === 'REJECT') {
            return {
              ...item,
              status: 'REJECTED',
              isPublished: false,
              rejectionReason: rejectionReason.trim() || 'Submission does not align with publication guidelines.',
            }
          }
        }
        return item
      })
    )

    setNotification({
      type: 'success',
      message: `Story "${story.title}" has been ${type === 'APPROVE' ? 'approved and published' : 'rejected'}.`,
    })

    setActionDialog(null)
    setSelectedStory(null)
    setRejectionReason('')
  }

  const columns = [
    {
      key: 'title',
      header: 'Story Title',
      cellClassName: 'font-medium text-slate-900',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1">{row.title}</p>
          <span className="text-[11px] text-slate-400">{row.category}</span>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.author}</p>
          {row.graduationYear && (
            <p className="text-xs text-slate-400">Class of {row.graduationYear}</p>
          )}
        </div>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (row) => fmtDate(row.submittedAt),
    },
    {
      key: 'status',
      header: 'Moderation Status',
      render: (row) => {
        const badgeMap = {
          APPROVED: { status: 'ACTIVE', label: 'Approved' },
          PENDING:  { status: 'SUBMITTED', label: 'Pending Review' },
          REJECTED: { status: 'REJECTED', label: 'Rejected' },
        }
        const b = badgeMap[row.status] || { status: 'INACTIVE', label: row.status }
        return <StatusBadge status={b.status} label={b.label} />
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedStory(row)}
            className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Review Story
          </button>
          {row.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => setActionDialog({ type: 'APPROVE', story: row })}
                className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setActionDialog({ type: 'REJECT', story: row })}
                className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Success Stories Moderation</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Review alumni career spotlights, verify submissions, and curate inspirational public features.
          </p>
        </div>
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
        <StatCard label="Total Submissions" value={loading ? '…' : totalCount} icon="🌟" />
        <StatCard label="Pending Review" value={loading ? '…' : pendingCount} icon="⏳" changeType="neutral" />
        <StatCard label="Approved & Published" value={loading ? '…' : approvedCount} icon="✅" changeType="positive" />
        <StatCard label="Rejected Submissions" value={loading ? '…' : rejectedCount} icon="❌" changeType="negative" />
      </div>

      {/* Main Table Card */}
      <AdminCard
        title="Alumni Stories Queue"
        subtitle="Review, approve, or reject spotlight submissions."
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by title, author, or keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
          >
            <option value="ALL">All Moderation Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved & Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Entrepreneurship">Entrepreneurship</option>
            <option value="Research & Academics">Research & Academics</option>
            <option value="Engineering & Technology">Engineering & Technology</option>
            <option value="Social Impact">Social Impact</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading stories…</div>
        ) : (
          <AdminTable
            columns={columns}
            data={filteredStories}
            emptyMessage="No success stories matching the current filter."
          />
        )}
      </AdminCard>

      {/* Story Review Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedStory(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {selectedStory.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedStory.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm max-h-[60vh] overflow-y-auto">
              {selectedStory.imageUrl && (
                <div className="overflow-hidden rounded-xl bg-slate-100 h-44">
                  <img
                    src={selectedStory.imageUrl}
                    alt={selectedStory.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Author</span>
                  <p className="text-slate-800 font-medium mt-0.5">{selectedStory.author}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge
                      status={selectedStory.status === 'APPROVED' ? 'ACTIVE' : selectedStory.status === 'PENDING' ? 'SUBMITTED' : 'REJECTED'}
                      label={selectedStory.status}
                    />
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Submission Date</span>
                  <p className="text-slate-700 mt-0.5">{fmtDate(selectedStory.submittedAt)}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Published Date</span>
                  <p className="text-slate-700 mt-0.5">{fmtDate(selectedStory.publishedAt)}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs">Story Content</span>
                <div className="mt-1.5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                  {selectedStory.content}
                </div>
              </div>

              {selectedStory.rejectionReason && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                  <strong className="block font-semibold">Rejection Note:</strong>
                  {selectedStory.rejectionReason}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedStory.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const st = selectedStory
                      setSelectedStory(null)
                      setActionDialog({ type: 'APPROVE', story: st })
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve & Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const st = selectedStory
                      setSelectedStory(null)
                      setActionDialog({ type: 'REJECT', story: st })
                    }}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Reject Submission
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Moderation Confirmation Dialog */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setActionDialog(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {actionDialog.type === 'APPROVE'
                ? 'Approve & Publish Story'
                : 'Reject Story Submission'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {actionDialog.type === 'APPROVE' ? (
                <>
                  Are you sure you want to approve{' '}
                  <span className="font-semibold text-slate-900">
                    &ldquo;{actionDialog.story.title}&rdquo;
                  </span>{' '}
                  by {actionDialog.story.author}? It will become immediately visible in the public alumni success stories showcase.
                </>
              ) : (
                <>
                  Provide an optional reason for rejecting{' '}
                  <span className="font-semibold text-slate-900">
                    &ldquo;{actionDialog.story.title}&rdquo;
                  </span>.
                </>
              )}
            </p>

            {actionDialog.type === 'REJECT' && (
              <div className="mt-3">
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection feedback for the author…"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-rose-400 focus:outline-none resize-none"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionDialog(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModeration}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white ${
                  actionDialog.type === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionDialog.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
