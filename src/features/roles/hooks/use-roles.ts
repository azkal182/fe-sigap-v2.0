import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  roleService,
  type PaginationParams,
  type CreateRoleDto,
  type UpdateRoleDto,
  type AssignPermissionsDto,
} from '../services/role-service'

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useRoles(params?: PaginationParams) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => roleService.getRoles(params),
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => roleService.getRole(id),
    enabled: !!id,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateRoleDto) => roleService.createRole(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      roleService.updateRole(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

/** Assign permissions (additive) — POST /roles/:id/permissions */
export function useAssignRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AssignPermissionsDto }) =>
      roleService.assignPermissions(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles', id] })
    },
  })
}

/** Replace ALL permissions — PUT /roles/:id/permissions */
export function useReplaceRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AssignPermissionsDto }) =>
      roleService.replacePermissions(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles', id] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

/** Remove single permission — DELETE /roles/:id/permissions/:permissionId */
export function useRemoveRolePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissionId }: { id: string; permissionId: string }) =>
      roleService.removePermission(id, permissionId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles', id] })
    },
  })
}
