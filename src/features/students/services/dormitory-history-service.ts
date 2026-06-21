import { apiPaginatedResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

export type DormitoryHistoryStatus =
  | 'ASSIGNED'
  | 'LEVEL_UP'
  | 'TRANSFERRED'
  | 'CHECKED_OUT'

export interface DormitoryHistory {
  id: string
  studentId: string
  fromDormitoryId?: string | null
  toDormitoryId: string
  startDate: string
  endDate?: string | null
  status: DormitoryHistoryStatus
  fromDormNameAtThatTime?: string | null
  toDormNameAtThatTime?: string | null
  fromLevel?: number | null
  toLevel: number
  changeReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface DormitoryHistoryListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  studentId?: string
  toDormitoryId?: string
  status?: DormitoryHistoryStatus
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

export const dormitoryHistoryService = {
  getDormitoryHistories: async (
    params?: DormitoryHistoryListParams
  ): Promise<PaginatedResponse<DormitoryHistory>> => {
    const response = apiPaginatedResponse<DormitoryHistory>(
      await api.get('/dormitory-histories', { params })
    )
    return { data: response.data, meta: response.meta }
  },
}
