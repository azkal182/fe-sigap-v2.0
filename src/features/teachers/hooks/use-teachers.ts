import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  teacherService,
  type TeacherListParams,
  type CreateTeacherDto,
  type UpdateTeacherDto,
  type CreateTeacherLoginDto,
  type LinkTeacherUserDto,
  type UpdateTeacherLoginDto,
} from '../services/teacher-service'

const QUERY_KEY = 'teachers-page'

export function useTeachers(params?: TeacherListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => teacherService.getTeachers({ ...params, includeDetails: true }),
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTeacherDto) => teacherService.createTeacher(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherDto }) =>
      teacherService.updateTeacher(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teacherService.deleteTeacher(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

// ─── Login sub-resource mutations ─────────────────────────────────────────────

export function useCreateTeacherLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTeacherLoginDto }) =>
      teacherService.createTeacherLogin(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useLinkTeacherUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LinkTeacherUserDto }) =>
      teacherService.linkTeacherUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateTeacherLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherLoginDto }) =>
      teacherService.updateTeacherLogin(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeactivateTeacherLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teacherService.deactivateTeacherLogin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
