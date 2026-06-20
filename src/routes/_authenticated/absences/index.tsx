import { createFileRoute } from '@tanstack/react-router'
import { Absences } from '@/features/absences'

export const Route = createFileRoute('/_authenticated/absences/')({
  component: Absences,
})
