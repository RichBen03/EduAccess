import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('accessToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authAPI.login(email, password)
    localStorage.setItem('accessToken', response.accessToken)
    setUser(response.user)
    return response
  }

  const register = async (userData) => {
    const response = await authAPI.register(userData)
    localStorage.setItem('accessToken', response.accessToken)
    setUser(response.user)
    return response
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
    }
  }

  const updateProfile = async (profileData) => {
    const updatedUser = await authAPI.updateProfile(profileData)
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  }

  // FIXED: Remove JSX from this file
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}