import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

export interface ScheduleSlot {
  id: string
  slot: number
  startTime: string // HH:mm
  endTime: string // HH:mm
  dormitoryId: string
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

export interface ScheduleSlotListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dormitoryId?: string
  slot?: number
}

export interface CreateScheduleSlotDto {
  slot: number
  startTime: string // HH:mm
  endTime: string // HH:mm
  dormitoryId: string
}

export interface UpdateScheduleSlotDto {
  slot?: number
  startTime?: string
  endTime?: string
  dormitoryId?: string
}

export const scheduleSlotService = {
  getScheduleSlots: async (
    params?: ScheduleSlotListParams
  ): Promise<PaginatedResponse<ScheduleSlot>> => {
    const response = apiPaginatedResponse<ScheduleSlot>(
      await api.get('/schedule-slots', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  createScheduleSlot: async (
    data: CreateScheduleSlotDto
  ): Promise<ScheduleSlot> => {
    const response = apiResponse<ScheduleSlot>(
      await api.post('/schedule-slots', data)
    )
    return response.data
  },

  updateScheduleSlot: async (
    id: string,
    data: UpdateScheduleSlotDto
  ): Promise<ScheduleSlot> => {
    const response = apiResponse<ScheduleSlot>(
      await api.patch(`/schedule-slots/${id}`, data)
    )
    return response.data
  },

  deleteScheduleSlot: async (id: string): Promise<void> => {
    await api.delete(`/schedule-slots/${id}`)
  },
}
