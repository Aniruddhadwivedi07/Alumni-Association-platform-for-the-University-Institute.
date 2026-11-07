import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/auth/me')
      .then((result) => setSession(result.data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setSession(result.data)
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      setSession(null)
    }
  }

  return <AuthContext.Provider value={{ session, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
