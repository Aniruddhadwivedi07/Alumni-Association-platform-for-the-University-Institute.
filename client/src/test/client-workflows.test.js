import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateProfile, EMPTY_PROFILE } from '../lib/profile.js'

describe('CLIENT WORKFLOWS & CLIENT VALIDATION', () => {
  it('should initialize empty profile structure safely', () => {
    assert.equal(EMPTY_PROFILE.fullName, '')
    assert.equal(EMPTY_PROFILE.email, '')
    assert.equal(EMPTY_PROFILE.graduationYear, '')
    assert.equal(EMPTY_PROFILE.department, '')
    assert.equal(EMPTY_PROFILE.currentJobTitle, '')
    assert.equal(EMPTY_PROFILE.currentCompany, '')
    assert.equal(EMPTY_PROFILE.bio, '')
    assert.equal(EMPTY_PROFILE.linkedinUrl, '')
  })

  it('should validate complete client profile successfully', () => {
    const valid = {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@gec.ac.in',
      graduationYear: '2021',
      department: 'Mechanical Engineering',
      currentJobTitle: 'Design Engineer',
      currentCompany: 'Tata Motors',
      linkedinUrl: 'https://www.linkedin.com/in/vikram-singh',
      bio: 'Automotive enthusiast and alumnus.',
    }
    const errors = validateProfile(valid)
    assert.deepEqual(errors, {})
  })

  it('should require fullName during profile update', () => {
    const missingName = {
      fullName: '   ',
      email: 'vikram.singh@gec.ac.in',
      graduationYear: '2021',
    }
    const errors = validateProfile(missingName)
    assert.ok(errors.fullName)
  })

  it('should reject invalid LinkedIn URLs in client validation', () => {
    const badUrl = {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@gec.ac.in',
      linkedinUrl: 'ht!tp://invalid-url',
    }
    const errors = validateProfile(badUrl)
    assert.ok(errors.linkedinUrl)
  })

  it('should validate reasonable graduation year ranges in client form', () => {
    const pastYear = {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@gec.ac.in',
      graduationYear: '1940',
    }
    const futureYear = {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@gec.ac.in',
      graduationYear: '2050',
    }
    const pastErrors = validateProfile(pastYear)
    const futureErrors = validateProfile(futureYear)
    assert.ok(pastErrors.graduationYear)
    assert.ok(futureErrors.graduationYear)
  })

  it('should validate password length when includePassword flag is active', () => {
    const shortPass = {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@gec.ac.in',
      password: '123',
    }
    const errors = validateProfile(shortPass, true)
    assert.ok(errors.password)
  })
})
