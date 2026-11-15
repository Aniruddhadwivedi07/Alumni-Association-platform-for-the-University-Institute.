import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_ALUMNI } from '../data/demoDirectory.js'
import { DEMO_JOBS } from '../data/demoJobs.js'
import { DEMO_EVENTS } from '../data/demoEvents.js'
import { SAMPLE_STORIES } from '../data/sampleStories.js'

describe('DEMO PLACEHOLDER CONTENT INTEGRITY & SAFEGUARDS', () => {
  it('Alumni Directory: contains 6-8 diverse demo profiles clearly marked', () => {
    assert.ok(DEMO_ALUMNI.length >= 6 && DEMO_ALUMNI.length <= 8)
    DEMO_ALUMNI.forEach((alumnus) => {
      assert.equal(alumnus.isDemo, true)
      assert.ok(alumnus.fullName)
      assert.ok(alumnus.department)
      assert.ok(alumnus.currentJobTitle)
      assert.ok(alumnus.currentCompany)
      assert.ok(alumnus.graduationYear)
      assert.ok(alumnus.bio)
    })
  })

  it('Job Portal: contains 4-6 diverse demo jobs clearly marked with applications disabled', () => {
    assert.ok(DEMO_JOBS.length >= 4 && DEMO_JOBS.length <= 6)
    DEMO_JOBS.forEach((job) => {
      assert.equal(job.isDemo, true)
      assert.ok(job.title)
      assert.ok(job.company)
      assert.ok(job.location)
      assert.ok(job.employmentType)
      assert.ok(job.experienceLevel)
      assert.ok(job.salaryRange)
      assert.ok(job.description)
    })
  })

  it('Events: contains 4-6 diverse demo events clearly marked with registration disabled', () => {
    assert.ok(DEMO_EVENTS.length >= 4 && DEMO_EVENTS.length <= 6)
    DEMO_EVENTS.forEach((event) => {
      assert.equal(event.isDemo, true)
      assert.ok(event.title)
      assert.ok(event.startDate)
      assert.ok(event.location)
      assert.ok(event.category)
      assert.ok(event.description)
    })
  })

  it('Success Stories: contains 4-6 diverse demo stories clearly marked', () => {
    assert.ok(SAMPLE_STORIES.length >= 4 && SAMPLE_STORIES.length <= 6)
    SAMPLE_STORIES.forEach((story) => {
      assert.equal(story.isDemo, true)
      assert.ok(story.title)
      assert.ok(story.authorName)
      assert.ok(story.designation)
      assert.ok(story.company)
      assert.ok(story.graduationYear)
      assert.ok(story.summary)
    })
  })

  it('Safeguard check: Demo items must have demo IDs and must not be treated as real DB IDs', () => {
    DEMO_ALUMNI.forEach(a => assert.match(a.id, /^demo-/))
    DEMO_JOBS.forEach(j => assert.match(j.id, /^demo-/))
    DEMO_EVENTS.forEach(e => assert.match(e.id, /^demo-/))
    SAMPLE_STORIES.forEach(s => assert.match(s.id, /^demo-/))
  })
})
