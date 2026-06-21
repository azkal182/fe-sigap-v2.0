import { createFileRoute } from '@tanstack/react-router'
import { TeacherAttendances } from '@/features/teacher-attendances'

export const Route = createFileRoute('/_authenticated/teacher-attendances/')({
  component: TeacherAttendances,
})
