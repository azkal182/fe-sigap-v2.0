import { api } from '@/lib/axios'
import { LoginDto, AuthResponse, UserProfileResponse } from '../types'

export const authService = {
  // Axios interceptor returns response.data (the backend wrapper object: {success, statusCode, data, ...})
  // So response.data below accesses the actual payload inside the wrapper.
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data) as any
    return response.data as AuthResponse
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get('/auth/me', {
      params: { includeScopes: true },
    }) as any
    return response.data as UserProfileResponse
  },
}
