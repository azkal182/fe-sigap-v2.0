import { api } from '@/lib/axios'
import { LoginDto, AuthResponse, UserProfileResponse } from '../types' // We'll need to define these

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data as AuthResponse // Based on the wrapper: response.data contains the actual payload
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
  
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get('/auth/me')
    return response.data as UserProfileResponse
  }
}
