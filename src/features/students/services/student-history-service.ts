import { apiPaginatedResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

export type StudentHistoryStatus =
  | 'STUDYING'
  | 'CLASS_TRANSFER'
  | 'TRACK_GRADUATED'

export interface StudentHistory {
  id: string
  studentId: string
  classId?: string
  startDate: string
  endDate?: string | null
  status: StudentHistoryStatus
  classNameAtThatTime?: string | null
  classTeacherAtThatTime?: string | null
  dormNameAtThatTime?: string | null
  trackNameAtThatTime?: string | null
  trackIdAtThatTime?: string | null
  dormitoryIdAtThatTime?: string | null
  changeReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface StudentHistoryListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  studentId?: string
  classId?: string
  status?: StudentHistoryStatus
  includeDetails?: boolean
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

export const studentHistoryService = {
  getStudentHistories: async (
    params?: StudentHistoryListParams
  ): Promise<PaginatedResponse<StudentHistory>> => {
    const response = apiPaginatedResponse<StudentHistory>(
      await api.get('/student-histories', { params })
    )
    return { data: response.data, meta: response.meta }
  },
}
