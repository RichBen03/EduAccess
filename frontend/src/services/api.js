import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        
        const newToken = response.data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data.data.user
  },

  updateProfile: async (profileData) => {
    const response = await api.put(`/users/${profileData.id}`, profileData)
    return response.data.data.user
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data.data
  },
}

// Resources API
const resourcesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/resources', { params })
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/resources/${id}`)
    return response.data.data.resource
  },

  upload: async (formData) => {
    const response = await api.post('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data.resource
  },

  download: async (id) => {
    const response = await api.get(`/resources/${id}/download`)
    return response.data.data
  },

  update: async (id, data) => {
    const response = await api.put(`/resources/${id}`, data)
    return response.data.data.resource
  },

  delete: async (id) => {
    const response = await api.delete(`/resources/${id}`)
    return response.data
  },

  getRelated: async (id) => {
    const response = await api.get(`/resources/${id}/related`)
    return response.data.data.resources
  },
}

// Schools API
const schoolsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/schools', { params })
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/schools/${id}`)
    return response.data.data.school
  },

  getStatistics: async (id) => {
    const response = await api.get(`/schools/${id}/statistics`)
    return response.data.data
  },

  getResources: async (id, params = {}) => {
    const response = await api.get(`/schools/${id}/resources`, { params })
    return response.data.data
  },
}

// Moderation API
const moderationAPI = {
  getPending: async (params = {}) => {
    const response = await api.get('/moderation/pending', { params })
    return response.data.data
  },

  approve: async (id, notes = '') => {
    const response = await api.post(`/moderation/resources/${id}/approve`, { notes })
    return response.data.data.resource
  },

  reject: async (id, notes) => {
    const response = await api.post(`/moderation/resources/${id}/reject`, { notes })
    return response.data.data.resource
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/moderation/history', { params })
    return response.data.data
  },

  getStatistics: async () => {
    const response = await api.get('/moderation/statistics')
    return response.data.data
  },
}

// Users API
const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data.data.user
  },

  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data)
    return response.data.data.user
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  getResources: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/resources`, { params })
    return response.data.data
  },

  getDownloads: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/downloads`, { params })
    return response.data.data
  },
}

// Export all APIs
export {
  authAPI,
  resourcesAPI,
  schoolsAPI,
  moderationAPI,
  usersAPI
}

export default api