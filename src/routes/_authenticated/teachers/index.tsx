import { createFileRoute } from '@tanstack/react-router'
import { Teachers } from '@/features/teachers'

export const Route = createFileRoute('/_authenticated/teachers/')({
  component: Teachers,
})
