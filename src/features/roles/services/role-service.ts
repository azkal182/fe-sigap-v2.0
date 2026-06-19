import { apiPaginatedResponse, apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
  id: string
  name: string
  description?: string
  isSystem?: boolean
  isActive?: boolean
  createdAt?: string
  permissions?: RolePermission[]
}

export interface RolePermission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  isActive?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateRoleDto {
  name: string
  description?: string
}

export interface UpdateRoleDto {
  name?: string
  description?: string
}

export interface AssignPermissionsDto {
  permissionIds: string[]
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const roleService = {
  /** GET /roles — list roles with pagination */
  getRoles: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Role>> => {
    const response = apiPaginatedResponse<Role>(
      await api.get('/roles', { params })
    )
    return { data: response.data, meta: response.meta }
  },

  /** GET /roles/:id — role detail with permissions */
  getRole: async (id: string): Promise<Role> => {
    const response = apiResponse<Role>(await api.get(`/roles/${id}`))
    return response.data
  },

  /** POST /roles — create role */
  createRole: async (dto: CreateRoleDto): Promise<Role> => {
    const response = apiResponse<Role>(await api.post('/roles', dto))
    return response.data
  },

  /** PATCH /roles/:id — update non-system role */
  updateRole: async (id: string, dto: UpdateRoleDto): Promise<Role> => {
    const response = apiResponse<Role>(await api.patch(`/roles/${id}`, dto))
    return response.data
  },

  /** DELETE /roles/:id — delete non-system role */
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`)
  },

  /** POST /roles/:id/permissions — assign permissions (additive) */
  assignPermissions: async (
    id: string,
    dto: AssignPermissionsDto
  ): Promise<void> => {
    await api.post(`/roles/${id}/permissions`, dto)
  },

  /** PUT /roles/:id/permissions — replace ALL permissions of role */
  replacePermissions: async (
    id: string,
    dto: AssignPermissionsDto
  ): Promise<void> => {
    await api.put(`/roles/${id}/permissions`, dto)
  },

  /** DELETE /roles/:id/permissions/:permissionId — remove one permission */
  removePermission: async (id: string, permissionId: string): Promise<void> => {
    await api.delete(`/roles/${id}/permissions/${permissionId}`)
  },
}
