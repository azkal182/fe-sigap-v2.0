import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  scheduleSlotService,
  type ScheduleSlotListParams,
  type CreateScheduleSlotDto,
  type UpdateScheduleSlotDto,
} from '../services/schedule-slot-service'

export function useScheduleSlots(params?: ScheduleSlotListParams, enabled = true) {
  return useQuery({
    queryKey: ['schedule-slots-page', params],
    queryFn: () => scheduleSlotService.getScheduleSlots(params),
    enabled,
  })
}

export function useCreateScheduleSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateScheduleSlotDto) =>
      scheduleSlotService.createScheduleSlot(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule-slots-page'] })
      // also invalidate the shared schedule-slots used in schedule form selects
      qc.invalidateQueries({ queryKey: ['schedule-slots'] })
    },
  })
}

export function useUpdateScheduleSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleSlotDto }) =>
      scheduleSlotService.updateScheduleSlot(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule-slots-page'] })
      qc.invalidateQueries({ queryKey: ['schedule-slots'] })
    },
  })
}

export function useDeleteScheduleSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => scheduleSlotService.deleteScheduleSlot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule-slots-page'] })
      qc.invalidateQueries({ queryKey: ['schedule-slots'] })
    },
  })
}
