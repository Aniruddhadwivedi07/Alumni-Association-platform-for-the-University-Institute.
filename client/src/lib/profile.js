export const EMPTY_PROFILE = {
  fullName: '',
  email: '',
  graduationYear: '',
  department: '',
  currentJobTitle: '',
  currentCompany: '',
  bio: '',
  linkedinUrl: '',
}

export function validateProfile(values, includePassword = false) {
  const errors = {}
  if (!values.fullName?.trim()) errors.fullName = 'Enter your full name.'
  if (!/^\S+@\S+\.\S+$/.test(values.email || '')) errors.email = 'Enter a valid email address.'
  if (includePassword && (values.password || '').length < 8) errors.password = 'Use at least 8 characters.'
  if (values.graduationYear && (!/^\d{4}$/.test(String(values.graduationYear)) || Number(values.graduationYear) < 1950 || Number(values.graduationYear) > new Date().getFullYear() + 8)) {
    errors.graduationYear = 'Enter a valid graduation year.'
  }
  if (values.linkedinUrl && !/^https:\/\/(www\.)?linkedin\.com\//i.test(values.linkedinUrl)) {
    errors.linkedinUrl = 'Enter a valid LinkedIn profile URL.'
  }
  return errors
}
