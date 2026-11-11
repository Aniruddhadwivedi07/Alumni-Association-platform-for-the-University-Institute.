import { useEffect, useState, useMemo, useCallback } from 'react'
import { AdminCard, StatCard } from '../../components/admin/AdminCard'
import { AdminTable, StatusBadge } from '../../components/admin/AdminTable'
import { apiRequest } from '../../lib/api'

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function deriveEventStatus(event, now) {
  if (!event.isActive) return 'CANCELLED'
  const start = new Date(event.startDate).getTime()
  const end = new Date(event.endDate).getTime()
  if (now > end) return 'PAST'
  if (now >= start) return 'ONGOING'
  return 'UPCOMING'
}

const EMPTY_FORM = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '17:00',
  registrationDeadline: '',
  capacity: '',
}

function combineDateTime(date, time) {
  if (!date) return null
  return `${date}T${time || '00:00'}:00`
}

function validateForm(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.description.trim()) errors.description = 'Description is required.'
  if (!form.startDate) errors.startDate = 'Start date is required.'
  if (!form.endDate) errors.endDate = 'End date is required.'

  if (form.startDate && form.endDate) {
    const start = new Date(combineDateTime(form.startDate, form.startTime))
    const end = new Date(combineDateTime(form.endDate, form.endTime))
    if (end <= start) errors.endDate = 'End date/time must be after start date/time.'

    if (form.registrationDeadline) {
      const dl = new Date(`${form.registrationDeadline}T23:59:59`)
      if (dl > start) {
        errors.registrationDeadline = 'Registration deadline must be before the event start.'
      }
    }
  }

  if (form.capacity !== '' && form.capacity !== null) {
    const cap = Number(form.capacity)
    if (!Number.isInteger(cap) || cap < 1) errors.capacity = 'Capacity must be a positive integer.'
  }

  return errors
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [attendees, setAttendeesData] = useState(null)
  const [attendeesLoading, setAttendeesLoading] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null) // null = create mode
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)
  const [formServerError, setFormServerError] = useState('')

  const [actionDialog, setActionDialog] = useState(null) // { type, event }
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const [currentTime] = useState(() => Date.now())

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchEvents = useCallback(() => {
    apiRequest('/events?limit=50&sortBy=startDate&sortOrder=desc')
      .then((res) => {
        setEvents(res.data || res.events || [])
        setError('')
      })
      .catch((err) => {
        setError(err.message || 'Failed to load events.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // ── Notifications ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 5000)
    return () => clearTimeout(t)
  }, [notification])

  // ── Derived Stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = events.length
    const upcoming = events.filter((e) => deriveEventStatus(e, currentTime) === 'UPCOMING').length
    const ongoing = events.filter((e) => deriveEventStatus(e, currentTime) === 'ONGOING').length
    const past = events.filter((e) => deriveEventStatus(e, currentTime) === 'PAST').length
    const cancelled = events.filter((e) => !e.isActive).length
    return { total, upcoming, ongoing, past, cancelled }
  }, [events, currentTime])

  // ── Filtered Table Data ────────────────────────────────────────────────────

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())

      const status = deriveEventStatus(e, currentTime)
      const matchesStatus =
        statusFilter === 'ALL' ||
        status === statusFilter ||
        (statusFilter === 'CANCELLED' && !e.isActive)

      return matchesSearch && matchesStatus
    })
  }, [events, search, statusFilter, currentTime])

  // ── Attendees ──────────────────────────────────────────────────────────────

  const viewAttendees = useCallback((event) => {
    setSelectedEvent(event)
    setAttendeesData(null)
    setAttendeesLoading(true)
    apiRequest(`/events/${event.id}/attendees?limit=50`)
      .then((res) => setAttendeesData(res.data || res.registrations || []))
      .catch(() => setAttendeesData([]))
      .finally(() => setAttendeesLoading(false))
  }, [])

  // ── Form Helpers ───────────────────────────────────────────────────────────

  function openCreateForm() {
    setEditingEvent(null)
    setFormData(EMPTY_FORM)
    setFormErrors({})
    setFormServerError('')
    setShowForm(true)
  }

  function openEditForm(event) {
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    const dl = event.registrationDeadline ? new Date(event.registrationDeadline) : null
    setEditingEvent(event)
    setFormData({
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      startDate: start.toISOString().slice(0, 10),
      startTime: start.toTimeString().slice(0, 5),
      endDate: end.toISOString().slice(0, 10),
      endTime: end.toTimeString().slice(0, 5),
      registrationDeadline: dl ? dl.toISOString().slice(0, 10) : '',
      capacity: event.capacity != null ? String(event.capacity) : '',
    })
    setFormErrors({})
    setFormServerError('')
    setShowForm(true)
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormLoading(true)
    setFormServerError('')

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim() || null,
      startDate: combineDateTime(formData.startDate, formData.startTime),
      endDate: combineDateTime(formData.endDate, formData.endTime),
      registrationDeadline: formData.registrationDeadline
        ? combineDateTime(formData.registrationDeadline, '23:59')
        : null,
      capacity: formData.capacity !== '' ? Number(formData.capacity) : null,
    }

    try {
      if (editingEvent) {
        await apiRequest(`/events/${editingEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setNotification({ type: 'success', message: `Event "${payload.title}" updated successfully.` })
      } else {
        await apiRequest('/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setNotification({ type: 'success', message: `Event "${payload.title}" created successfully.` })
      }
      setShowForm(false)
      setEditingEvent(null)
      fetchEvents()
    } catch (err) {
      setFormServerError(err.message || 'Failed to save event. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Moderation Actions ─────────────────────────────────────────────────────

  const handleConfirmAction = async () => {
    if (!actionDialog) return
    const { type, event } = actionDialog
    setActionLoading(true)

    try {
      if (type === 'CANCEL') {
        // DELETE /api/events/:eventId — sets isActive = false
        await apiRequest(`/events/${event.id}`, { method: 'DELETE' })
        setNotification({ type: 'success', message: `Event "${event.title}" was cancelled.` })
      }
      setActionDialog(null)
      fetchEvents()
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Action failed. Please try again.' })
      setActionDialog(null)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Table Columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'title',
      header: 'Event Title',
      cellClassName: 'max-w-[180px] truncate font-medium text-slate-900',
      render: (row) => (
        <span className="block max-w-[180px] truncate" title={row.title}>
          {row.title}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Date',
      render: (row) => fmtDate(row.startDate),
    },
    {
      key: 'location',
      header: 'Location',
      render: (row) => row.location || <span className="text-slate-400">—</span>,
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (row) =>
        row.capacity != null ? row.capacity : <span className="text-slate-400">Unlimited</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const s = deriveEventStatus(row, currentTime)
        const statusMap = {
          UPCOMING: { status: 'ACTIVE', label: 'Upcoming' },
          ONGOING: { status: 'SUBMITTED', label: 'Ongoing' },
          PAST: { status: 'RESOLVED', label: 'Past' },
          CANCELLED: { status: 'REJECTED', label: 'Cancelled' },
        }
        const badge = statusMap[s] || { status: s, label: s }
        return <StatusBadge status={badge.status} label={badge.label} />
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => viewAttendees(row)}
            className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Attendees
          </button>
          <button
            type="button"
            onClick={() => openEditForm(row)}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Edit
          </button>
          {row.isActive && (
            <button
              type="button"
              onClick={() => setActionDialog({ type: 'CANCEL', event: row })}
              className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Events Administration</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Create, manage, and moderate alumni association events.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          + Create Event
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Events" value={loading ? '…' : stats.total} icon="📅" />
        <StatCard label="Upcoming" value={loading ? '…' : stats.upcoming} icon="🔜" changeType="positive" />
        <StatCard label="Ongoing" value={loading ? '…' : stats.ongoing} icon="▶️" changeType="neutral" />
        <StatCard label="Past" value={loading ? '…' : stats.past} icon="✅" changeType="neutral" />
        <StatCard label="Cancelled" value={loading ? '…' : stats.cancelled} icon="🚫" changeType="negative" />
      </div>

      {/* Filters and Table */}
      <AdminCard
        title="All Events"
        subtitle={`${filteredEvents.length} record(s) shown`}
        action={
          <button
            type="button"
            onClick={fetchEvents}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            ↻ Refresh
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by title or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="PAST">Past</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading events…</div>
        ) : (
          <AdminTable
            columns={columns}
            data={filteredEvents}
            emptyMessage="No events found. Use 'Create Event' to add one."
          />
        )}
      </AdminCard>

      {/* Attendees Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedEvent.title}</h3>
                <p className="text-xs text-slate-500">
                  {fmtDateTime(selectedEvent.startDate)} – {fmtDateTime(selectedEvent.endDate)}
                  {selectedEvent.location ? ` · ${selectedEvent.location}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
                  <div className="mt-1">
                    <StatusBadge
                      status={selectedEvent.isActive ? 'ACTIVE' : 'REJECTED'}
                      label={selectedEvent.isActive ? deriveEventStatus(selectedEvent, currentTime) : 'Cancelled'}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Capacity</span>
                  <p className="mt-1 font-medium text-slate-800">
                    {selectedEvent.capacity != null ? selectedEvent.capacity : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Reg. Deadline</span>
                  <p className="mt-1 font-medium text-slate-800">
                    {fmtDate(selectedEvent.registrationDeadline)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Created By</span>
                  <p className="mt-1 font-medium text-slate-800">
                    {selectedEvent.createdBy?.alumniProfile?.fullName ||
                      selectedEvent.createdBy?.email ||
                      `User #${selectedEvent.createdById}`}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-500">Description</span>
                <div className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  {selectedEvent.description}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 block mb-2">
                  Registered Attendees
                  {attendees != null ? ` (${attendees.length})` : ''}
                </span>
                {attendeesLoading ? (
                  <p className="text-xs text-slate-500">Loading attendees…</p>
                ) : attendees && attendees.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200">
                    <table className="min-w-full text-xs divide-y divide-slate-100">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Name / Email</th>
                          <th className="px-3 py-2 text-left">Registered</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendees.map((reg, idx) => (
                          <tr key={reg.id || idx}>
                            <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2 text-slate-800">
                              {reg.user?.alumniProfile?.fullName || reg.user?.email || `User #${reg.userId}`}
                            </td>
                            <td className="px-3 py-2 text-slate-500">{fmtDate(reg.registeredAt)}</td>
                            <td className="px-3 py-2">
                              <StatusBadge status={reg.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No registrations yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { setSelectedEvent(null); openEditForm(selectedEvent) }}
                className="rounded-lg border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Edit Event
              </button>
              {selectedEvent.isActive && (
                <button
                  type="button"
                  onClick={() => { const ev = selectedEvent; setSelectedEvent(null); setActionDialog({ type: 'CANCEL', event: ev }) }}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Cancel Event
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !formLoading && setShowForm(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                type="button"
                onClick={() => !formLoading && setShowForm(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {formServerError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {formServerError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    maxLength={200}
                    placeholder="Annual Alumni Reunion 2026"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                      formErrors.title ? 'border-rose-400 focus:border-rose-400' : 'border-slate-300 focus:border-indigo-400'
                    }`}
                  />
                  {formErrors.title && <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="A brief overview of the event…"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none ${
                      formErrors.description ? 'border-rose-400 focus:border-rose-400' : 'border-slate-300 focus:border-indigo-400'
                    }`}
                  />
                  {formErrors.description && <p className="mt-1 text-xs text-rose-600">{formErrors.description}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    maxLength={200}
                    placeholder="Auditorium, Block A / Online (Zoom)"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                {/* Start Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none ${
                        formErrors.startDate ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-400'
                      }`}
                    />
                    {formErrors.startDate && <p className="mt-1 text-xs text-rose-600">{formErrors.startDate}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none ${
                        formErrors.endDate ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-400'
                      }`}
                    />
                    {formErrors.endDate && <p className="mt-1 text-xs text-rose-600">{formErrors.endDate}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleFormChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none ${
                      formErrors.registrationDeadline ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-400'
                    }`}
                  />
                  {formErrors.registrationDeadline && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.registrationDeadline}</p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-400">Must be on or before the event start date.</p>
                </div>

                {/* Capacity */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    min="1"
                    step="1"
                    placeholder="Leave blank for unlimited"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                      formErrors.capacity ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-400'
                    }`}
                  />
                  {formErrors.capacity && <p className="mt-1 text-xs text-rose-600">{formErrors.capacity}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {formLoading ? 'Saving…' : editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog (Cancel Event) */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setActionDialog(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Confirm Event Cancellation</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to cancel{' '}
              <span className="font-semibold text-slate-900">
                &ldquo;{actionDialog.event.title}&rdquo;
              </span>
              ? This action will deactivate the event and remove it from public listings. Existing
              registrations will remain on record.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setActionDialog(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Event
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling…' : 'Yes, Cancel Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

