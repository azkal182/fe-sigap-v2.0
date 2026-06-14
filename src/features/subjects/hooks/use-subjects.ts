import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  subjectService,
  type SubjectListParams,
  type CreateSubjectDto,
  type UpdateSubjectDto,
} from '../services/subject-service'

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useSubjects(params?: SubjectListParams) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => subjectService.getSubjects({ ...params, includeDetails: true }),
  })
}

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectService.getSubject(id!),
    enabled: !!id,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubjectDto) => subjectService.createSubject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useUpdateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectDto }) =>
      subjectService.updateSubject(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useDeleteSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subjectService.deleteSubject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}
