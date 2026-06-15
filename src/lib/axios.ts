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

    // Handle 401 Unauthorized: attempt token refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().auth.refreshToken

      if (refreshToken) {
        try {
          // Use a plain axios call (not `api`) to avoid infinite interceptor loop
          const { default: axios } = await import('axios')
          const baseURL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1`
          const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
          const { accessToken: newAccess, refreshToken: newRefresh } = res.data?.data ?? res.data

          useAuthStore.getState().auth.setTokens(newAccess, newRefresh ?? refreshToken)

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return api(originalRequest)
        } catch {
          // Refresh failed — clear session and redirect
        }
      }

      useAuthStore.getState().auth.reset()
      toast.error('Session expired. Please login again.')
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
