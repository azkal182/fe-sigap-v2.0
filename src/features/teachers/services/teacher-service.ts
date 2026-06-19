import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeacherDormitory {
  id: string
  name: string
  level: number
  gender: string
}

export interface Teacher {
  id: string
  name: string
  phone?: string
  isActive: boolean
  userId?: string
  /** Present when teacher has a linked login user */
  user?: {
    id: string
    email: string
    name: string
    isActive: boolean
  }
  /** Dormitories this teacher is assigned to */
  dormitories?: TeacherDormitory[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface TeacherListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  userId?: string
  dormitoryId?: string
  hasUser?: boolean
  isActive?: boolean
  /** Include linked `user` and assigned `dormitories` objects in response */
  includeDetails?: boolean
}

export interface CreateTeacherDto {
  name: string
  phone?: string
  userId?: string
  dormitoryIds?: string[]
}

export interface UpdateTeacherDto {
  name?: string
  phone?: string
  dormitoryIds?: string[]
  isActive?: boolean
}

// ─── Login user DTOs ──────────────────────────────────────────────────────────

/** Create a brand-new login account for the teacher */
export interface CreateTeacherLoginDto {
  email: string
  password: string
  name?: string
}

/** Link an existing non-system user to this teacher */
export interface LinkTeacherUserDto {
  userId: string
}

export interface UpdateTeacherLoginDto {
  email?: string
  password?: string
  name?: string
  isActive?: boolean
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const teacherService = {
  // Core CRUD
  getTeachers: async (
    params?: TeacherListParams
  ): Promise<PaginatedResponse<Teacher>> => {
    const response = apiPaginatedResponse<Teacher>(
      await api.get('/teachers', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  getTeacherById: async (id: string): Promise<Teacher> => {
    const response = apiResponse<Teacher>(await api.get(`/teachers/${id}`))
    return response.data
  },

  createTeacher: async (data: CreateTeacherDto): Promise<Teacher> => {
    const response = apiResponse<Teacher>(await api.post('/teachers', data))
    return response.data
  },

  updateTeacher: async (
    id: string,
    data: UpdateTeacherDto
  ): Promise<Teacher> => {
    const response = apiResponse<Teacher>(
      await api.patch(`/teachers/${id}`, data)
    )
    return response.data
  },

  deleteTeacher: async (id: string): Promise<void> => {
    await api.delete(`/teachers/${id}`)
  },

  // Sub-resource: login account
  createTeacherLogin: async (
    id: string,
    data: CreateTeacherLoginDto
  ): Promise<void> => {
    await api.post(`/teachers/${id}/user`, data)
  },

  linkTeacherUser: async (
    id: string,
    data: LinkTeacherUserDto
  ): Promise<void> => {
    await api.post(`/teachers/${id}/user`, data)
  },

  updateTeacherLogin: async (
    id: string,
    data: UpdateTeacherLoginDto
  ): Promise<void> => {
    await api.patch(`/teachers/${id}/user`, data)
  },

  deactivateTeacherLogin: async (id: string): Promise<void> => {
    await api.delete(`/teachers/${id}/user`)
  },
}
