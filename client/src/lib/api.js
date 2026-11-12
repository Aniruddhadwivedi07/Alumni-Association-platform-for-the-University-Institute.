const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error('The server could not be reached. Check your connection and try again.')
  }

  const contentType = response.headers.get('content-type') || ''
  const result = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {}
  if (!response.ok) throw new Error(result.error?.message || result.message || `Request failed (${response.status}).`)
  return result
}
