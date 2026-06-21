import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  absenceService,
  type AbsenceListParams,
} from '@/features/absences/services/absence-service'
import {
  dormitoryHistoryService,
  type DormitoryHistoryListParams,
} from '../services/dormitory-history-service'
import {
  permitService,
  type PermitListParams,
  type CreatePermitDto,
} from '../services/permit-service'
import {
  studentHistoryService,
  type StudentHistoryListParams,
} from '../services/student-history-service'

// ─── Student Histories ────────────────────────────────────────────────────────

export function useStudentHistories(params?: StudentHistoryListParams) {
  return useQuery({
    queryKey: ['student-histories', params],
    queryFn: () => studentHistoryService.getStudentHistories(params),
    enabled: !!params?.studentId,
    staleTime: 30_000,
  })
}

// ─── Dormitory Histories ──────────────────────────────────────────────────────

export function useDormitoryHistories(params?: DormitoryHistoryListParams) {
  return useQuery({
    queryKey: ['dormitory-histories', params],
    queryFn: () => dormitoryHistoryService.getDormitoryHistories(params),
    enabled: !!params?.studentId,
    staleTime: 30_000,
  })
}

// ─── Permits ──────────────────────────────────────────────────────────────────

export function useStudentPermits(params?: PermitListParams) {
  return useQuery({
    queryKey: ['permits', params],
    queryFn: () =>
      permitService.getPermits({ ...params, includeDetails: false }),
    enabled: !!params?.studentId,
    staleTime: 30_000,
  })
}

export function useCreatePermit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePermitDto) => permitService.createPermit(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits'] })
    },
  })
}

export function useDeletePermit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => permitService.deletePermit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits'] })
    },
  })
}

// ─── Absences (for student detail) ───────────────────────────────────────────

export function useStudentAbsences(params?: AbsenceListParams) {
  return useQuery({
    queryKey: ['absences', 'student-detail', params],
    queryFn: () => absenceService.getAbsences(params),
    enabled: !!params?.studentId,
    staleTime: 30_000,
  })
}
