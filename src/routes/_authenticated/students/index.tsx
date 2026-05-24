import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Students } from '@/features/students'

const studentsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
  gender: z.string().optional(),
  status: z.string().optional(),
  dormitoryId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/students/')({
  validateSearch: studentsSearchSchema,
  component: Students,
})
