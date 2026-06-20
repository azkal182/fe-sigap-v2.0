import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

export type AbsenceStatus = 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT'

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

export interface AbsenceRosterItem {
  studentId: string
  studentName: string
  studentNis: string
  status: AbsenceStatus
  note: string | null
  absenceId: string | null
  source?: 'absence' | 'permit' | 'default'
  permit?: {
    id: string
    type: 'SICK' | 'PERMIT'
    reason: string
    startDate: string
    endDate: string | null
    allowedSlots: number[]
  } | null
}

export interface CurrentAbsenceSession {
  absentDate: string
  currentTime: string
  dayOfWeek: number
  schedule: {
    id: string
    dayOfWeek: number
  }
  class: {
    id: string
    name: string
  }
  dormitory: {
    id: string
    name: string | null
    level: number | null
    gender: string | null
  }
  track: {
    id: string
    name: string | null
    level: number | null
  }
  subject: {
    id: string
    name: string
  }
  teacher: {
    id: string
    name: string
  }
  scheduleSlot: {
    id: string
    slot: number
    startTime: string
    endTime: string
  }
  items: AbsenceRosterItem[]
}

export interface CurrentAbsenceSessionResponse {
  activeSession: CurrentAbsenceSession | null
  reason?: string
  absentDate?: string
  currentTime?: string
  dayOfWeek?: number
}

export interface AbsenceListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  studentId?: string
  scheduleId?: string
  status?: AbsenceStatus
  absentDateFrom?: string
  absentDateTo?: string
}

export interface AbsenceRecord {
  id: string
  studentId: string
  scheduleId: string
  absentDate: string
  status: AbsenceStatus
  note: string | null
  createdAt?: string
  updatedAt?: string
  student?: {
    id: string
    name: string
    nis: string
  }
  schedule?: {
    id: string
    class?: {
      id: string
      name: string
    }
    subject?: {
      id: string
      name: string
    }
    teacher?: {
      id: string
      name: string
    }
    scheduleSlot?: {
      id: string
      slot: number
      startTime: string
      endTime: string
    }
  }
}

export interface ClassroomDailyAbsenceParams {
  classId: string
  scheduleSlotId: string
  absentDate: string
}

export interface ClassroomDailyAbsenceResponse {
  items: AbsenceRosterItem[]
}

export interface UpsertClassroomDailyAbsenceDto {
  classId: string
  scheduleSlotId: string
  absentDate: string
  items: Array<{
    studentId: string
    status: AbsenceStatus
    note?: string
  }>
}

export const absenceService = {
  getAbsences: async (
    params?: AbsenceListParams
  ): Promise<PaginatedResponse<AbsenceRecord>> => {
    const response = apiPaginatedResponse<AbsenceRecord>(
      await api.get('/absences', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  getMyCurrentSession: async (
    absentDate?: string
  ): Promise<CurrentAbsenceSessionResponse> => {
    const response = apiResponse<CurrentAbsenceSessionResponse>(
      await api.get('/absences/my-current-session', {
        params: absentDate ? { absentDate } : undefined,
      })
    )
    return response.data
  },

  getClassroomDaily: async (
    params: ClassroomDailyAbsenceParams
  ): Promise<ClassroomDailyAbsenceResponse> => {
    const response = apiResponse<ClassroomDailyAbsenceResponse>(
      await api.get('/absences/classroom-daily', { params })
    )
    return response.data
  },

  upsertClassroomDaily: async (
    data: UpsertClassroomDailyAbsenceDto
  ): Promise<void> => {
    await api.put('/absences/classroom-daily', data)
  },
}
