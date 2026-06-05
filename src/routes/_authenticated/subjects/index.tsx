import { createFileRoute } from '@tanstack/react-router'
import { Subjects } from '@/features/subjects'

export const Route = createFileRoute('/_authenticated/subjects/')({
  component: Subjects,
})
