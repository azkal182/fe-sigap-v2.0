import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Subject {
  id: string
  name: string
  trackId: string
  track?: {
    id: string
    name: string
    level: number
    dormitoryId: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface SubjectListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  trackId?: string
  dormitoryId?: string
  /** Include track: { id, name, level, dormitoryId } in response */
  includeDetails?: boolean
}

export interface CreateSubjectDto {
  name: string
  trackId: string
}

export interface UpdateSubjectDto {
  name?: string
  trackId?: string
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

// ─── Service ──────────────────────────────────────────────────────────────────

export const subjectService = {
  getSubjects: async (
    params?: SubjectListParams
  ): Promise<PaginatedResponse<Subject>> => {
    const response = apiPaginatedResponse<Subject>(
      await api.get('/subjects', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  getSubject: async (id: string): Promise<Subject> => {
    const response = apiResponse<Subject>(await api.get(`/subjects/${id}`))
    return response.data
  },

  createSubject: async (data: CreateSubjectDto): Promise<Subject> => {
    const response = apiResponse<Subject>(await api.post('/subjects', data))
    return response.data
  },

  updateSubject: async (
    id: string,
    data: UpdateSubjectDto
  ): Promise<Subject> => {
    const response = apiResponse<Subject>(
      await api.patch(`/subjects/${id}`, data)
    )
    return response.data
  },

  deleteSubject: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`)
  },
}
