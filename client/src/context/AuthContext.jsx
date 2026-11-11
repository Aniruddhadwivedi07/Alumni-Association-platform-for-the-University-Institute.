import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refreshUser() {
    try {
      const result = await apiRequest('/auth/me')
      setUser(result.data)
      return result.data
    } catch {
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    let isMounted = true
    apiRequest('/auth/me')
      .then((result) => {
        if (isMounted) setUser(result.data)
      })
      .catch(() => {
        if (isMounted) setUser(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function login(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(result.data)
    return result.data
  }

  async function register(registrationData) {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    })
    return result
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    session: user, // Alias for backward compatibility with existing components
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
