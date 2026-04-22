import { api } from '@/lib/axios'

export interface User {
  id: string
  email: string
  name: string
  isActive?: boolean
  role?: {
    id: string
    name: string
  }
  createdAt?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  isActive?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateUserDto {
  email: string
  password?: string
  name: string
  roleId: string
}

export interface UpdateUserDto {
  email?: string
  password?: string
  name?: string
  roleId?: string
  isActive?: boolean
}

export const userService = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params }) as any
    return {
      data: response.data,
      meta: response.meta,
    }
  },
  
  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data) as any
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data) as any
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  }
}

export interface Role {
  id: string
  name: string
  description?: string
}

export const roleService = {
  getRoles: async (params?: PaginationParams): Promise<PaginatedResponse<Role>> => {
    const response = await api.get('/roles', { params }) as any
    return {
      data: response.data,
      meta: response.meta,
    }
  }
}
