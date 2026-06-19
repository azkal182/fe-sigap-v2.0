import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DormitoryGender = 'PUTRA' | 'PUTRI'

export interface Dormitory {
  id: string
  name: string
  level: number
  gender: DormitoryGender
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  level?: number
  gender?: DormitoryGender
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

export interface CreateDormitoryDto {
  name: string
  level: number
  gender: DormitoryGender
}

export interface UpdateDormitoryDto {
  name?: string
  level?: number
  gender?: DormitoryGender
  isActive?: boolean
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const dormitoryService = {
  /** GET /dormitories — list with pagination + filters (scope-aware) */
  getDormitories: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Dormitory>> => {
    const response = apiPaginatedResponse<Dormitory>(
      await api.get('/dormitories', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  /** GET /dormitories/:id — single dormitory detail (scope-aware) */
  getDormitory: async (id: string): Promise<Dormitory> => {
    const response = apiResponse<Dormitory>(await api.get(`/dormitories/${id}`))
    return response.data
  },

  /** POST /dormitories — create new dormitory */
  createDormitory: async (dto: CreateDormitoryDto): Promise<Dormitory> => {
    const response = apiResponse<Dormitory>(await api.post('/dormitories', dto))
    return response.data
  },

  /** PATCH /dormitories/:id — update dormitory (name, level, gender, isActive) */
  updateDormitory: async (
    id: string,
    dto: UpdateDormitoryDto
  ): Promise<Dormitory> => {
    const response = apiResponse<Dormitory>(
      await api.patch(`/dormitories/${id}`, dto)
    )
    return response.data
  },

  /** DELETE /dormitories/:id — permanently delete dormitory */
  deleteDormitory: async (id: string): Promise<void> => {
    await api.delete(`/dormitories/${id}`)
  },
}
