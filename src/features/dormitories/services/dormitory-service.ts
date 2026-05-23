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
    const response = (await api.get('/dormitories', { params })) as any
    return { data: response.data, meta: response.meta }
  },

  /** GET /dormitories/:id — single dormitory detail (scope-aware) */
  getDormitory: async (id: string): Promise<Dormitory> => {
    const response = (await api.get(`/dormitories/${id}`)) as any
    return response.data as Dormitory
  },

  /** POST /dormitories — create new dormitory */
  createDormitory: async (dto: CreateDormitoryDto): Promise<Dormitory> => {
    const response = (await api.post('/dormitories', dto)) as any
    return response.data as Dormitory
  },

  /** PATCH /dormitories/:id — update dormitory (name, level, gender, isActive) */
  updateDormitory: async (
    id: string,
    dto: UpdateDormitoryDto
  ): Promise<Dormitory> => {
    const response = (await api.patch(`/dormitories/${id}`, dto)) as any
    return response.data as Dormitory
  },

  /** DELETE /dormitories/:id — permanently delete dormitory */
  deleteDormitory: async (id: string): Promise<void> => {
    await api.delete(`/dormitories/${id}`)
  },
}
