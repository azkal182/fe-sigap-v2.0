import { api } from '@/lib/axios'

// ─── Permission Types ────────────────────────────────────────────────────────

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

export interface UserEffectivePermissions {
  /** Combined permissions (from role + direct) */
  effective: string[]
  /** Permissions coming from the user's role */
  fromRole: string[]
  /** Permissions directly assigned to the user */
  direct: string[]
}

export interface AssignPermissionsDto {
  permissionIds: string[]
}

// ─── Scope Types ─────────────────────────────────────────────────────────────

export interface UserScope {
  resource: string
  resourceIds: string[]
}

export interface AssignScopesDto {
  resource: string
  resourceIds: string[]
}

export interface RemoveScopesDto {
  resource: string
  resourceIds: string[]
}

// ─── Permissions Service ─────────────────────────────────────────────────────

export const permissionService = {
  /** List all available permissions (optionally filtered by resource) */
  getAllPermissions: async (resource?: string): Promise<Permission[]> => {
    const response = await api.get('/permissions', {
      params: resource ? { resource } : undefined,
    }) as any
    return response.data as Permission[]
  },

  /** GET /users/:id/permissions — effective permissions (role + direct) */
  getUserPermissions: async (userId: string): Promise<UserEffectivePermissions> => {
    const response = await api.get(`/users/${userId}/permissions`) as any
    return response.data as UserEffectivePermissions
  },

  /** POST /users/:id/permissions — assign direct permissions to user */
  assignUserPermissions: async (
    userId: string,
    dto: AssignPermissionsDto
  ): Promise<void> => {
    await api.post(`/users/${userId}/permissions`, dto)
  },

  /** DELETE /users/:id/permissions/:permissionId — remove one direct permission */
  removeUserPermission: async (
    userId: string,
    permissionId: string
  ): Promise<void> => {
    await api.delete(`/users/${userId}/permissions/${permissionId}`)
  },
}

// ─── Scopes Service ──────────────────────────────────────────────────────────

export const scopeService = {
  /** GET /users/:id/scopes — all resource scopes for user */
  getUserScopes: async (userId: string): Promise<UserScope[]> => {
    const response = await api.get(`/users/${userId}/scopes`) as any
    return response.data as UserScope[]
  },

  /** POST /users/:id/scopes — assign resource scopes to user */
  assignUserScopes: async (
    userId: string,
    dto: AssignScopesDto
  ): Promise<void> => {
    await api.post(`/users/${userId}/scopes`, dto)
  },

  /** DELETE /users/:id/scopes — remove resource scopes from user */
  removeUserScopes: async (
    userId: string,
    dto: RemoveScopesDto
  ): Promise<void> => {
    await api.delete(`/users/${userId}/scopes`, { data: dto })
  },
}

// ─── Dormitory Types & Service ───────────────────────────────────────────────

export interface Dormitory {
  id: string
  name: string
  level: number
  gender: 'PUTRA' | 'PUTRI'
  isActive?: boolean
}

export interface DormitoriesResponse {
  data: Dormitory[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const dormitoryService = {
  /** GET /dormitories — list all dormitories (scope-aware) */
  getDormitories: async (params?: {
    limit?: number
    isActive?: boolean
  }): Promise<DormitoriesResponse> => {
    const response = await api.get('/dormitories', { params }) as any
    return { data: response.data, meta: response.meta }
  },
}
