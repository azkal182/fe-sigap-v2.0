import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  trackService,
  classroomService,
  type TrackListParams,
  type ClassroomListParams,
  type CreateClassroomDto,
  type UpdateClassroomDto,
} from '../services/classroom-service'

// ─── Tracks ───────────────────────────────────────────────────────────────────

export function useTracks(params?: TrackListParams) {
  return useQuery({
    queryKey: ['tracks', params],
    queryFn: () => trackService.getTracks(params),
    // Only fetch when we have a dormitory selected (or fetch all if no dormitoryId)
    enabled: true,
    staleTime: 30_000,
  })
}

/** Convenience: fetch all tracks for a given dormitory (for dropdown) */
export function useTracksByDormitory(dormitoryId: string | undefined) {
  return useQuery({
    queryKey: ['tracks', { dormitoryId, limit: 100 }],
    queryFn: () => trackService.getTracks({ dormitoryId, limit: 100 }),
    enabled: !!dormitoryId,
    staleTime: 30_000,
  })
}

// ─── Classrooms ───────────────────────────────────────────────────────────────

export function useClassrooms(params?: ClassroomListParams) {
  return useQuery({
    queryKey: ['classrooms', params],
    // Always include details so we get track, dormitory, counts in list view
    queryFn: () => classroomService.getClassrooms({ ...params, includeDetails: true }),
  })
}

export function useCreateClassroom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClassroomDto) => classroomService.createClassroom(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  })
}

export function useUpdateClassroom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassroomDto }) =>
      classroomService.updateClassroom(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  })
}

export function useDeleteClassroom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classroomService.deleteClassroom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  })
}

// ─── Student histories in a class ────────────────────────────────────────────

import {
  studentHistoryService,
  scheduleService,
} from '../services/classroom-service'

export function useClassStudents(classId: string | undefined, status?: 'STUDYING' | 'CLASS_TRANSFER' | 'TRACK_GRADUATED') {
  return useQuery({
    queryKey: ['class-students', classId, status],
    queryFn: () =>
      studentHistoryService.getStudentHistories({
        classId,
        status: status ?? 'STUDYING',
        limit: 100,
        includeDetails: true, // get student: { id, name, nis, gender }
      }),
    enabled: !!classId,
  })
}

// ─── Schedules for a class ───────────────────────────────────────────────────

export function useClassSchedules(classId: string | undefined) {
  return useQuery({
    queryKey: ['class-schedules', classId],
    queryFn: () =>
      scheduleService.getSchedules({
        classId,
        active: true,
        limit: 100,
        includeDetails: true, // get subject, teacher, scheduleSlot
      }),
    enabled: !!classId,
  })
}

