import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  studentService,
  type PaginationParams,
  type CreateStudentDto,
  type UpdateStudentDto,
} from '../services/student-service'

export function useStudents(params?: PaginationParams) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.getStudents(params),
  })
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.getStudent(id),
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateStudentDto) => studentService.createStudent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
      studentService.updateStudent(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
