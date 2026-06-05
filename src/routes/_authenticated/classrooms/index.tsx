import { createFileRoute } from '@tanstack/react-router'
import { Classrooms } from '@/features/classrooms'

export const Route = createFileRoute('/_authenticated/classrooms/')({
  component: Classrooms,
})
