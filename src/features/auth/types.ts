export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: string
  user: {
    id: string
    email: string
    name: string
  }
}

export interface UserProfileResponse {
  id: string
  email: string
  name: string
  isActive: boolean
  role: {
    id: string | null
    name: string | null
    isSystem: boolean | null
  }
  permissions: string[]
  teacher?: { id: string }
  /** Only present when includeScopes=true */
  scopes?: Array<{ resource: string; resourceId: string }>
  dormitoryScopeIds?: string[]
  dormitoryScopes?: Array<{
    id: string
    name: string
    level: number
    gender: 'PUTRA' | 'PUTRI'
  }>
  createdAt: string
  updatedAt: string
}
