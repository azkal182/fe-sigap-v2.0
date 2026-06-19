import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  teacherService,
  scheduleSlotService,
  scheduleService,
  type TeacherListParams,
  type ScheduleSlotListParams,
  type ScheduleListParams,
  type CreateScheduleDto,
  type UpdateScheduleDto,
} from '../services/schedule-service'

// ─── Teachers ─────────────────────────────────────────────────────────────────

export function useTeachers(params?: TeacherListParams) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => teacherService.getTeachers(params),
    staleTime: 30_000,
  })
}

/** All active teachers for a dormitory — for use in form selects */
export function useTeachersByDormitory(dormitoryId: string | undefined) {
  return useQuery({
    queryKey: ['teachers', { dormitoryId, isActive: true, limit: 100 }],
    queryFn: () =>
      teacherService.getTeachers({ dormitoryId, isActive: true, limit: 100 }),
    enabled: !!dormitoryId,
    staleTime: 30_000,
  })
}

// ─── Schedule Slots ───────────────────────────────────────────────────────────

export function useScheduleSlots(params?: ScheduleSlotListParams) {
  return useQuery({
    queryKey: ['schedule-slots', params],
    queryFn: () => scheduleSlotService.getScheduleSlots(params),
    staleTime: 60_000,
  })
}

/** All slots for a given dormitory — for form selects, sorted by slot number */
export function useScheduleSlotsByDormitory(dormitoryId: string | undefined) {
  return useQuery({
    queryKey: [
      'schedule-slots',
      { dormitoryId, limit: 100, sortBy: 'slot', sortOrder: 'asc' },
    ],
    queryFn: () =>
      scheduleSlotService.getScheduleSlots({
        dormitoryId,
        limit: 100,
        sortBy: 'slot',
        sortOrder: 'asc',
      }),
    enabled: !!dormitoryId,
    staleTime: 60_000,
  })
}

// ─── Schedules ────────────────────────────────────────────────────────────────

export function useSchedules(params?: ScheduleListParams, enabled = true) {
  return useQuery({
    queryKey: ['schedules', params],
    queryFn: () =>
      scheduleService.getSchedules({ ...params, includeDetails: true }),
    enabled,
  })
}

export function useCreateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateScheduleDto) =>
      scheduleService.createSchedule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  })
}

export function useUpdateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleDto }) =>
      scheduleService.updateSchedule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  })
}

export function useDeactivateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => scheduleService.deactivateSchedule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  })
}
