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
  role?: {
    id: string
    name: string
  }
  permissions?: string[]
}
