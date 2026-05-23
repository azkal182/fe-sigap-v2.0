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
    const response = (await api.get('/permissions', {
      params: resource ? { resource } : undefined,
    })) as any
    return response.data as Permission[]
  },
}
