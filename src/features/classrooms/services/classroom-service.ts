import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

// ─── Shared pagination types ──────────────────────────────────────────────────

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

// ─── Track ────────────────────────────────────────────────────────────────────

export interface Track {
  id: string
  name: string
  level: number
  targetDays?: number
  dormitoryId: string
}

export interface TrackListParams {
  page?: number
  limit?: number
  dormitoryId?: string
  level?: number
  search?: string
}

export const trackService = {
  getTracks: async (
    params?: TrackListParams
  ): Promise<PaginatedResponse<Track>> => {
    const response = apiPaginatedResponse<Track>(
      await api.get('/tracks', { params })
    )
    return { data: response.data, meta: response.meta }
  },
}

// ─── Classroom ────────────────────────────────────────────────────────────────

export interface Classroom {
  id: string
  name: string
  teacher: string
  teacherId?: string | null
  trackId: string
  dormitoryId: string
  active: boolean
  /** Present when includeDetails=true */
  track?: {
    id: string
    name: string
    level: number
  }
  /** Present when includeDetails=true */
  dormitory?: {
    id: string
    name: string
    gender: 'PUTRA' | 'PUTRI'
    level: number
  }
  /** Present when includeDetails=true */
  activeStudentCount?: number
  /** Present when includeDetails=true */
  scheduleCount?: number
}

export interface ClassroomListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  dormitoryId?: string
  trackId?: string
  teacherId?: string
  active?: boolean
  /** Include track, dormitory, activeStudentCount, scheduleCount in response */
  includeDetails?: boolean
}

export interface CreateClassroomDto {
  name: string
  teacher: string
  trackId: string
  dormitoryId: string
  teacherId?: string
  active?: boolean
}

export interface UpdateClassroomDto {
  name?: string
  teacher?: string
  trackId?: string
  dormitoryId?: string
  teacherId?: string | null
  active?: boolean
}

export const classroomService = {
  getClassrooms: async (
    params?: ClassroomListParams
  ): Promise<PaginatedResponse<Classroom>> => {
    const response = apiPaginatedResponse<Classroom>(
      await api.get('/classes', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  getClassroom: async (id: string): Promise<Classroom> => {
    const response = apiResponse<Classroom>(await api.get(`/classes/${id}`))
    return response.data
  },

  createClassroom: async (data: CreateClassroomDto): Promise<Classroom> => {
    const response = apiResponse<Classroom>(await api.post('/classes', data))
    return response.data
  },

  updateClassroom: async (
    id: string,
    data: UpdateClassroomDto
  ): Promise<Classroom> => {
    const response = apiResponse<Classroom>(
      await api.patch(`/classes/${id}`, data)
    )
    return response.data
  },

  deleteClassroom: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`)
  },
}

// ─── Student History (students in a class) ────────────────────────────────────

export type StudentHistoryStatus =
  | 'STUDYING'
  | 'CLASS_TRANSFER'
  | 'TRACK_GRADUATED'

export interface StudentHistory {
  id: string
  studentId: string
  classId?: string
  startDate: string
  endDate?: string
  status: StudentHistoryStatus
  classNameAtThatTime?: string
  student?: {
    id: string
    nis: string
    name: string
    gender?: 'PUTRA' | 'PUTRI'
    status?: string
  }
}

export interface StudentHistoryListParams {
  page?: number
  limit?: number
  classId?: string
  studentId?: string
  status?: StudentHistoryStatus
  /** Include student: { id, name, nis, gender } in response */
  includeDetails?: boolean
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

// ─── Schedule (jadwal per kelas) ──────────────────────────────────────────────

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Schedule {
  id: string
  classId: string
  subjectId: string
  teacherId: string
  scheduleSlotId: string
  dayOfWeek: DayOfWeek
  validFrom: string
  validTo?: string
  active?: boolean
  subject?: { id: string; name: string }
  teacher?: { id: string; name: string }
  scheduleSlot?: {
    id: string
    slot: number
    startTime: string
    endTime: string
  }
}

export interface ScheduleListParams {
  page?: number
  limit?: number
  classId?: string
  dayOfWeek?: number
  active?: boolean
  /** Include subject, teacher, scheduleSlot, class in response */
  includeDetails?: boolean
}

export const scheduleService = {
  getSchedules: async (
    params?: ScheduleListParams
  ): Promise<PaginatedResponse<Schedule>> => {
    const response = apiPaginatedResponse<Schedule>(
      await api.get('/schedules', { params })
    )
    return { data: response.data, meta: response.meta }
  },
}
