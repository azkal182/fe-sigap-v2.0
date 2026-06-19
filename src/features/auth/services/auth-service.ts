import { apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'
import type { LoginDto, AuthResponse, UserProfileResponse } from '../types'

export const authService = {
  // Axios interceptor returns response.data (the backend wrapper object: {success, statusCode, data, ...})
  // So response.data below accesses the actual payload inside the wrapper.
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = apiResponse<AuthResponse>(
      await api.post('/auth/login', data)
    )
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getProfile: async (): Promise<UserProfileResponse> => {
    const response = apiResponse<UserProfileResponse>(
      await api.get('/auth/me', {
        params: { includeScopes: true },
      })
    )
    return response.data
  },
}
