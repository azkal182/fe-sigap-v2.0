import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Teachers } from '@/features/teachers'

const teachersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
  dormitoryId: z.string().optional(),
  isActive: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/teachers/')({
  validateSearch: teachersSearchSchema,
  component: Teachers,
})
