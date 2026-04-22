import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().auth.accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return the response data directly assuming typical backend success wrapper
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loops
      originalRequest._retry = true
      
      // If unauthorized, clear auth and redirect to login
      useAuthStore.getState().auth.reset()
      toast.error('Session expired. Please login again.')
      
      // Redirect to login (assuming window.location for simplicity, or we can use tanstack router)
      window.location.href = '/sign-in'
      
      return Promise.reject(error)
    }

    // Display error message from backend if available
    const backendMessage = error.response?.data?.message
    if (backendMessage && !originalRequest.url?.includes('/auth/me')) {
      toast.error(backendMessage)
    }

    return Promise.reject(error)
  }
)
