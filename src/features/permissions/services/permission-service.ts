import { apiResponse } from '@/lib/api-response'
import { api } from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const permissionService = {
  /** GET /permissions — list all permissions, optionally filtered by resource */
  getPermissions: async (resource?: string): Promise<Permission[]> => {
    const response = apiResponse<Permission[]>(
      await api.get('/permissions', {
        params: resource ? { resource } : undefined,
      })
    )
    return response.data
  },
}
