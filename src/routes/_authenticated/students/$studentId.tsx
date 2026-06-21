import { createFileRoute } from '@tanstack/react-router'
import { StudentDetail } from '@/features/students/components/student-detail'

export const Route = createFileRoute('/_authenticated/students/$studentId')({
  component: StudentDetailPage,
})

function StudentDetailPage() {
  const { studentId } = Route.useParams()
  return <StudentDetail studentId={studentId} />
}
