import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userService,
  roleService,
  type PaginationParams,
  type CreateUserDto,
  type UpdateUserDto,
} from '../services/user-service'
import {
  permissionService,
  scopeService,
  dormitoryService,
  type AssignPermissionsDto,
  type AssignScopesDto,
  type RemoveScopesDto,
} from '../services/permission-service'

// ─── User Queries & Mutations ─────────────────────────────────────────────────

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
  })
}

export function useRoles(params?: PaginationParams) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => roleService.getRoles(params),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/** Bulk update (e.g. activate/deactivate) — runs PATCH for each id in parallel */
export function useBulkUpdateUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ids,
      data,
    }: {
      ids: string[]
      data: UpdateUserDto
    }) => Promise.all(ids.map((id) => userService.updateUser(id, data))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/** Bulk delete — runs DELETE for each id in parallel */
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => userService.deleteUser(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ─── Permission Queries & Mutations ───────────────────────────────────────────

/** All available permissions in the system (for the picker list) */
export function useAllPermissions(resource?: string) {
  return useQuery({
    queryKey: ['permissions', resource],
    queryFn: () => permissionService.getAllPermissions(resource),
    staleTime: 60 * 1000, // permissions rarely change
  })
}

/** Effective permissions of a specific user (role + direct) */
export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => permissionService.getUserPermissions(userId),
    enabled: !!userId,
  })
}

export function useAssignUserPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: AssignPermissionsDto }) =>
      permissionService.assignUserPermissions(userId, dto),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] })
    },
  })
}

export function useRemoveUserPermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      permissionId,
    }: {
      userId: string
      permissionId: string
    }) => permissionService.removeUserPermission(userId, permissionId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] })
    },
  })
}

// ─── Scopes Queries & Mutations ───────────────────────────────────────────────

export function useUserScopes(userId: string) {
  return useQuery({
    queryKey: ['user-scopes', userId],
    queryFn: () => scopeService.getUserScopes(userId),
    enabled: !!userId,
  })
}

export function useAssignUserScopes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: AssignScopesDto }) =>
      scopeService.assignUserScopes(userId, dto),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-scopes', userId] })
    },
  })
}

export function useRemoveUserScopes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: RemoveScopesDto }) =>
      scopeService.removeUserScopes(userId, dto),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-scopes', userId] })
    },
  })
}

// ─── Dormitory Queries ────────────────────────────────────────────────────────

/** Fetch all active dormitories for use in selectors/checkboxes */
export function useDormitories(params?: { limit?: number; isActive?: boolean }) {
  return useQuery({
    queryKey: ['dormitories', params],
    queryFn: () => dormitoryService.getDormitories(params),
    staleTime: 30 * 1000,
  })
}

