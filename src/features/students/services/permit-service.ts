import { apiPaginatedResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

export type PermitType = 'SICK' | 'PERMIT'

export interface StudentPermit {
  id: string
  studentId: string
  startDate: string
  endDate?: string | null
  allowedSlots: number[]
  reason: string
  type: PermitType
  createdByUserId?: string
  createdAt?: string
  updatedAt?: string
  student?: { id: string; name: string; nis: string; gender: string }
  createdBy?: { id: string; name: string; email: string }
}

export interface PermitListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  studentId?: string
  type?: PermitType
  createdByUserId?: string
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
  includeDetails?: boolean
}

export interface CreatePermitDto {
  studentId: string
  startDate: string
  endDate?: string
  allowedSlots?: number[]
  reason: string
  type: PermitType
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

export const permitService = {
  getPermits: async (
    params?: PermitListParams
  ): Promise<PaginatedResponse<StudentPermit>> => {
    const response = apiPaginatedResponse<StudentPermit>(
      await api.get('/permits', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  createPermit: async (dto: CreatePermitDto): Promise<StudentPermit> => {
    const { apiResponse } = await import('@/lib/api-response')
    const response = apiResponse<StudentPermit>(await api.post('/permits', dto))
    return response.data
  },

  deletePermit: async (id: string): Promise<void> => {
    await api.delete(`/permits/${id}`)
  },
}
