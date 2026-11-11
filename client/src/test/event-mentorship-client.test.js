import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// ─── A. EVENT ADMINISTRATION CLIENT VALIDATION ───────────────────────────────

describe('A. EVENT CLIENT VALIDATION & FORM INTEGRITY', () => {
  function validateEventForm(form) {
    const errors = {}
    if (!form.title?.trim()) errors.title = 'Title is required.'
    if (!form.description?.trim()) errors.description = 'Description is required.'
    if (!form.startDate) errors.startDate = 'Start date is required.'
    if (!form.endDate) errors.endDate = 'End date is required.'

    if (form.startDate && form.endDate) {
      const start = new Date(`${form.startDate}T${form.startTime || '00:00'}:00`)
      const end = new Date(`${form.endDate}T${form.endTime || '00:00'}:00`)
      if (end <= start) errors.endDate = 'End date/time must be after start date/time.'

      if (form.registrationDeadline) {
        const dl = new Date(`${form.registrationDeadline}T23:59:59`)
        if (dl > start) {
          errors.registrationDeadline = 'Registration deadline must be before the event start.'
        }
      }
    }

    if (form.capacity !== '' && form.capacity !== null && form.capacity !== undefined) {
      const cap = Number(form.capacity)
      if (!Number.isInteger(cap) || cap < 1) errors.capacity = 'Capacity must be a positive integer.'
    }

    return errors
  }

  it('should pass client validation with complete and valid event details', () => {
    const form = {
      title: 'Alumni Tech Talk 2026',
      description: 'Panel talk on AI developments.',
      location: 'Seminar Hall B',
      startDate: '2026-12-05',
      startTime: '10:00',
      endDate: '2026-12-05',
      endTime: '13:00',
      registrationDeadline: '2026-12-04',
      capacity: '100',
    }

    const errors = validateEventForm(form)
    assert.deepEqual(errors, {})
  })

  it('should flag errors when required fields (title, description, dates) are missing', () => {
    const form = {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    }

    const errors = validateEventForm(form)
    assert.ok(errors.title)
    assert.ok(errors.description)
    assert.ok(errors.startDate)
    assert.ok(errors.endDate)
  })

  it('should flag error when end date/time is before start date/time', () => {
    const form = {
      title: 'Workshop',
      description: 'Hands-on workshop.',
      startDate: '2026-12-05',
      startTime: '14:00',
      endDate: '2026-12-05',
      endTime: '11:00',
    }

    const errors = validateEventForm(form)
    assert.ok(errors.endDate)
  })

  it('should flag error when registration deadline is after event start', () => {
    const form = {
      title: 'Hackathon',
      description: '24hr coding contest.',
      startDate: '2026-12-05',
      startTime: '09:00',
      endDate: '2026-12-06',
      endTime: '18:00',
      registrationDeadline: '2026-12-06',
    }

    const errors = validateEventForm(form)
    assert.ok(errors.registrationDeadline)
  })

  it('should flag error for invalid capacity values', () => {
    const form = {
      title: 'Seminar',
      description: 'Lecture series.',
      startDate: '2026-12-05',
      endDate: '2026-12-06',
      capacity: '-5',
    }

    const errors = validateEventForm(form)
    assert.ok(errors.capacity)
  })
})

// ─── B. EVENT LIFECYCLE & STATUS DERIVATION ──────────────────────────────────

describe('B. EVENT STATUS DERIVATION & FILTERING', () => {
  function deriveEventStatus(event, now) {
    if (!event.isActive) return 'CANCELLED'
    const start = new Date(event.startDate).getTime()
    const end = new Date(event.endDate).getTime()
    if (now > end) return 'PAST'
    if (now >= start) return 'ONGOING'
    return 'UPCOMING'
  }

  const now = new Date('2026-11-15T12:00:00Z').getTime()

  it('should correctly derive UPCOMING status for future event', () => {
    const event = {
      isActive: true,
      startDate: '2026-11-20T10:00:00Z',
      endDate: '2026-11-20T18:00:00Z',
    }
    assert.equal(deriveEventStatus(event, now), 'UPCOMING')
  })

  it('should correctly derive ONGOING status when current time is between start and end', () => {
    const event = {
      isActive: true,
      startDate: '2026-11-15T09:00:00Z',
      endDate: '2026-11-15T17:00:00Z',
    }
    assert.equal(deriveEventStatus(event, now), 'ONGOING')
  })

  it('should correctly derive PAST status when event has ended', () => {
    const event = {
      isActive: true,
      startDate: '2026-11-01T10:00:00Z',
      endDate: '2026-11-01T18:00:00Z',
    }
    assert.equal(deriveEventStatus(event, now), 'PAST')
  })

  it('should correctly prioritize CANCELLED status when isActive is false', () => {
    const event = {
      isActive: false,
      startDate: '2026-11-20T10:00:00Z',
      endDate: '2026-11-20T18:00:00Z',
    }
    assert.equal(deriveEventStatus(event, now), 'CANCELLED')
  })
})

// ─── C. MENTORSHIP CLIENT LOGIC & STATUS TRANSITIONS ─────────────────────────

describe('C. MENTORSHIP MANAGEMENT CLIENT LOGIC', () => {
  function statusBadgeProps(status) {
    const map = {
      PENDING:   { status: 'SUBMITTED',  label: 'Pending' },
      ACCEPTED:  { status: 'ACTIVE',     label: 'Accepted' },
      REJECTED:  { status: 'REJECTED',   label: 'Rejected' },
      COMPLETED: { status: 'RESOLVED',   label: 'Completed' },
      CANCELLED: { status: 'INACTIVE',   label: 'Cancelled' },
    }
    return map[status] || { status, label: status }
  }

  it('should map mentorship statuses to appropriate badge props', () => {
    assert.equal(statusBadgeProps('PENDING').status, 'SUBMITTED')
    assert.equal(statusBadgeProps('ACCEPTED').status, 'ACTIVE')
    assert.equal(statusBadgeProps('REJECTED').status, 'REJECTED')
    assert.equal(statusBadgeProps('COMPLETED').status, 'RESOLVED')
    assert.equal(statusBadgeProps('CANCELLED').status, 'INACTIVE')
  })

  it('should filter mentorship requests by search keyword across mentor and mentee', () => {
    const requests = [
      { id: 1, mentor: { alumniProfile: { fullName: 'Dr. Jane Smith' } }, student: { alumniProfile: { fullName: 'Bob Roy' } } },
      { id: 2, mentor: { alumniProfile: { fullName: 'Alice Wong' } }, student: { alumniProfile: { fullName: 'John Doe' } } },
    ]

    const filterByKeyword = (list, kw) =>
      list.filter((r) => {
        const mentor = r.mentor?.alumniProfile?.fullName || ''
        const mentee = r.student?.alumniProfile?.fullName || ''
        return mentor.toLowerCase().includes(kw.toLowerCase()) || mentee.toLowerCase().includes(kw.toLowerCase())
      })

    const foundJane = filterByKeyword(requests, 'Jane')
    assert.equal(foundJane.length, 1)
    assert.equal(foundJane[0].id, 1)

    const foundJohn = filterByKeyword(requests, 'john')
    assert.equal(foundJohn.length, 1)
    assert.equal(foundJohn[0].id, 2)
  })

  it('should compute mentorship KPI counts correctly from data array', () => {
    const requests = [
      { id: 1, status: 'PENDING' },
      { id: 2, status: 'PENDING' },
      { id: 3, status: 'ACCEPTED' },
      { id: 4, status: 'REJECTED' },
      { id: 5, status: 'COMPLETED' },
      { id: 6, status: 'CANCELLED' },
    ]

    const counts = {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      accepted: requests.filter((r) => r.status === 'ACCEPTED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
      completed: requests.filter((r) => r.status === 'COMPLETED').length,
      cancelled: requests.filter((r) => r.status === 'CANCELLED').length,
    }

    assert.equal(counts.total, 6)
    assert.equal(counts.pending, 2)
    assert.equal(counts.accepted, 1)
    assert.equal(counts.rejected, 1)
    assert.equal(counts.completed, 1)
    assert.equal(counts.cancelled, 1)
  })
})
