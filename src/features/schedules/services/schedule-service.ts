import { api } from '@/lib/axios'

// ─── Shared ───────────────────────────────────────────────────────────────────

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

// ─── Teacher ──────────────────────────────────────────────────────────────────

export interface Teacher {
  id: string
  name: string
  phone?: string
  isActive?: boolean
  userId?: string
}

export interface TeacherListParams {
  page?: number
  limit?: number
  search?: string
  dormitoryId?: string
  isActive?: boolean
}

export const teacherService = {
  getTeachers: async (
    params?: TeacherListParams
  ): Promise<PaginatedResponse<Teacher>> => {
    const response = (await api.get('/teachers', { params })) as any
    return { data: response.data, meta: response.meta }
  },
}

// ─── Schedule Slot ────────────────────────────────────────────────────────────

export interface ScheduleSlot {
  id: string
  slot: number
  startTime: string // HH:mm
  endTime: string   // HH:mm
  dormitoryId: string
}

export interface ScheduleSlotListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dormitoryId?: string
  slot?: number
}

export const scheduleSlotService = {
  getScheduleSlots: async (
    params?: ScheduleSlotListParams
  ): Promise<PaginatedResponse<ScheduleSlot>> => {
    const response = (await api.get('/schedule-slots', { params })) as any
    return { data: response.data, meta: response.meta }
  },
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

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
  /** Present when includeDetails=true */
  class?: { id: string; name: string; dormitoryId: string; trackId: string }
  /** Present when includeDetails=true */
  subject?: { id: string; name: string }
  /** Present when includeDetails=true */
  teacher?: { id: string; name: string }
  /** Present when includeDetails=true */
  scheduleSlot?: { id: string; slot: number; startTime: string; endTime: string }
}

export interface ScheduleListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  classId?: string
  subjectId?: string
  teacherId?: string
  scheduleSlotId?: string
  /** Filter by classroom dormitory ID (new API support) */
  dormitoryId?: string
  dayOfWeek?: number
  active?: boolean
  validFromFrom?: string
  validFromTo?: string
  includeDetails?: boolean
}

export interface CreateScheduleDto {
  classId: string
  subjectId: string
  teacherId: string
  scheduleSlotId: string
  dayOfWeek: number
  validFrom: string
}

export interface UpdateScheduleDto {
  classId?: string
  subjectId?: string
  teacherId?: string
  scheduleSlotId?: string
  dayOfWeek?: number
}

export const scheduleService = {
  getSchedules: async (
    params?: ScheduleListParams
  ): Promise<PaginatedResponse<Schedule>> => {
    const response = (await api.get('/schedules', { params })) as any
    return { data: response.data, meta: response.meta }
  },

  createSchedule: async (data: CreateScheduleDto): Promise<Schedule> => {
    const response = (await api.post('/schedules', data)) as any
    return response.data
  },

  updateSchedule: async (id: string, data: UpdateScheduleDto): Promise<Schedule> => {
    const response = (await api.patch(`/schedules/${id}`, data)) as any
    return response.data
  },

  /** Deactivate (soft-delete) — sets validTo, does not hard-delete */
  deactivateSchedule: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`)
  },
}
