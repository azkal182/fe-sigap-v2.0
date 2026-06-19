import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dormitoryService } from '@/features/users/services/permission-service'

/** Fetch all active dormitories and return as SelectDropdown-compatible options */
export function useDormitoryOptions() {
  const { data } = useQuery({
    queryKey: ['dormitories', { limit: 100, isActive: true }],
    queryFn: () =>
      dormitoryService.getDormitories({ limit: 100, isActive: true }),
    staleTime: 30 * 1000,
  })

  return useMemo(
    () =>
      (data?.data ?? []).map((d) => ({
        label: `${d.name} (Level ${d.level} — ${d.gender === 'PUTRA' ? 'Putra' : 'Putri'})`,
        value: d.id,
      })),
    [data]
  )
}
