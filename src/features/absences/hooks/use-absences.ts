import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  absenceService,
  type AbsenceListParams,
  type ClassroomDailyAbsenceParams,
  type UpsertClassroomDailyAbsenceDto,
} from '../services/absence-service'

const ABSENCES_QUERY_KEY = 'absences'

export function useAbsences(params?: AbsenceListParams) {
  return useQuery({
    queryKey: [ABSENCES_QUERY_KEY, 'list', params],
    queryFn: () => absenceService.getAbsences(params),
    staleTime: 15_000,
  })
}

export function useMyCurrentAbsenceSession(absentDate?: string) {
  return useQuery({
    queryKey: [ABSENCES_QUERY_KEY, 'my-current-session', absentDate],
    queryFn: () => absenceService.getMyCurrentSession(absentDate),
    staleTime: 15_000,
  })
}

export function useClassroomDailyAbsence(
  params: ClassroomDailyAbsenceParams | undefined
) {
  return useQuery({
    queryKey: [ABSENCES_QUERY_KEY, 'classroom-daily', params],
    queryFn: () => absenceService.getClassroomDaily(params!),
    enabled:
      !!params?.classId && !!params.scheduleSlotId && !!params.absentDate,
    staleTime: 15_000,
  })
}

export function useUpsertClassroomDailyAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpsertClassroomDailyAbsenceDto) =>
      absenceService.upsertClassroomDaily(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ABSENCES_QUERY_KEY] })
    },
  })
}
