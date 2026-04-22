import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'access_token'
const REFRESH_TOKEN = 'refresh_token'

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: {
    id: string
    name: string
  }
  permissions?: string[] // Optional, depending on /auth/me payload
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    refreshToken: string
    setTokens: (accessToken: string, refreshToken: string) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieAccess = getCookie(ACCESS_TOKEN)
  const cookieRefresh = getCookie(REFRESH_TOKEN)
  
  const initAccessToken = cookieAccess ? JSON.parse(cookieAccess) : ''
  const initRefreshToken = cookieRefresh ? JSON.parse(cookieRefresh) : ''

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initAccessToken,
      refreshToken: initRefreshToken,
      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          if (refreshToken) {
            setCookie(REFRESH_TOKEN, JSON.stringify(refreshToken))
          }
          return { ...state, auth: { ...state.auth, accessToken, refreshToken } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(REFRESH_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', refreshToken: '' },
          }
        }),
    },
  }
})
