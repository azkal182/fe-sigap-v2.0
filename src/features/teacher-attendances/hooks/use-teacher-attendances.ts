import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  teacherAttendanceService,
  type TeacherAttendanceDailyParams,
  type TeacherAttendanceListParams,
  type UpsertTeacherAttendanceDailyDto,
} from '../services/teacher-attendance-service'

const QK = 'teacher-attendances'

export function useTeacherAttendances(params?: TeacherAttendanceListParams) {
  return useQuery({
    queryKey: [QK, 'list', params],
    queryFn: () =>
      teacherAttendanceService.getTeacherAttendances({
        ...params,
        includeDetails: true,
      }),
    staleTime: 15_000,
  })
}

export function useTeacherAttendanceDailyRoster(
  params: TeacherAttendanceDailyParams | undefined
) {
  return useQuery({
    queryKey: [QK, 'daily', params],
    queryFn: () => teacherAttendanceService.getDailyRoster(params!),
    enabled:
      !!params?.dormitoryId && !!params.scheduleSlotId && !!params.attendDate,
    staleTime: 15_000,
  })
}

export function useUpsertTeacherAttendanceDaily() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpsertTeacherAttendanceDailyDto) =>
      teacherAttendanceService.upsertDailyRoster(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] })
    },
  })
}
