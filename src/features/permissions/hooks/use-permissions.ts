import { useQuery } from '@tanstack/react-query'
import { permissionService } from '../services/permission-service'

/** GET /permissions — all system permissions, optional resource filter */
export function usePermissions(resource?: string) {
  return useQuery({
    queryKey: ['permissions', resource ?? 'all'],
    queryFn: () => permissionService.getPermissions(resource),
    staleTime: 60 * 1000, // permissions list rarely changes
  })
}
