import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dormitoryService,
  type PaginationParams,
  type CreateDormitoryDto,
  type UpdateDormitoryDto,
} from '../services/dormitory-service'

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useDormitories(params?: PaginationParams) {
  return useQuery({
    queryKey: ['dormitories', params],
    queryFn: () => dormitoryService.getDormitories(params),
  })
}

export function useDormitory(id: string) {
  return useQuery({
    queryKey: ['dormitories', id],
    queryFn: () => dormitoryService.getDormitory(id),
    enabled: !!id,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateDormitory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateDormitoryDto) =>
      dormitoryService.createDormitory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dormitories'] })
    },
  })
}

export function useUpdateDormitory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDormitoryDto }) =>
      dormitoryService.updateDormitory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dormitories'] })
    },
  })
}

export function useDeleteDormitory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dormitoryService.deleteDormitory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dormitories'] })
    },
  })
}

/** Quick toggle isActive status for a dormitory */
export function useToggleDormitoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      dormitoryService.updateDormitory(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dormitories'] })
    },
  })
}
