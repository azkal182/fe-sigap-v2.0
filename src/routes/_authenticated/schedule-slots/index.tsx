import { createFileRoute } from '@tanstack/react-router'
import { ScheduleSlots } from '@/features/schedule-slots'

export const Route = createFileRoute('/_authenticated/schedule-slots/')({
  component: ScheduleSlots,
})
