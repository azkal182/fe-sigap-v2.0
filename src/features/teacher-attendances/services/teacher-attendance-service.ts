import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TeacherAttendanceStatus = 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT'

export interface TeacherAttendanceDailyItem {
  teacherId: string
  teacherName: string
  scheduleId: string
  class: { id: string; name: string }
  subject: { id: string; name: string }
  scheduleSlot: { id: string; slot: number; startTime: string; endTime: string }
  status: TeacherAttendanceStatus | null
  note: string | null
  teacherAttendanceId: string | null
  source: 'attendance' | 'empty'
}

export interface TeacherAttendanceDailyResponse {
  dormitoryId: string
  scheduleSlotId: string
  attendDate: string
  dayOfWeek: number
  total: number
  items: TeacherAttendanceDailyItem[]
}

export interface TeacherAttendanceDailyParams {
  dormitoryId: string
  scheduleSlotId: string
  attendDate: string
}

export interface UpsertTeacherAttendanceDailyDto {
  dormitoryId: string
  scheduleSlotId: string
  attendDate: string
  items: Array<{
    teacherId: string
    scheduleId: string
    status: TeacherAttendanceStatus
    note?: string
  }>
}

export interface TeacherAttendanceRecord {
  id: string
  teacherId: string
  scheduleId: string
  attendDate: string
  status: TeacherAttendanceStatus
  note: string | null
  createdAt?: string
  updatedAt?: string
  teacher?: { id: string; name: string }
  schedule?: {
    id: string
    class?: { id: string; name: string }
    subject?: { id: string; name: string }
    teacher?: { id: string; name: string }
    scheduleSlot?: {
      id: string
      slot: number
      startTime: string
      endTime: string
    }
  }
}

export interface TeacherAttendanceListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  teacherId?: string
  scheduleId?: string
  status?: TeacherAttendanceStatus
  attendDateFrom?: string
  attendDateTo?: string
  dormitoryId?: string
  scheduleSlotId?: string
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

// ─── Service ──────────────────────────────────────────────────────────────────

export const teacherAttendanceService = {
  getTeacherAttendances: async (
    params?: TeacherAttendanceListParams
  ): Promise<PaginatedResponse<TeacherAttendanceRecord>> => {
    const response = apiPaginatedResponse<TeacherAttendanceRecord>(
      await api.get('/teacher-attendances', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  getDailyRoster: async (
    params: TeacherAttendanceDailyParams
  ): Promise<TeacherAttendanceDailyResponse> => {
    const response = apiResponse<TeacherAttendanceDailyResponse>(
      await api.get('/teacher-attendances/daily', { params })
    )
    return response.data
  },

  upsertDailyRoster: async (
    data: UpsertTeacherAttendanceDailyDto
  ): Promise<void> => {
    await api.put('/teacher-attendances/daily', data)
  },
}
