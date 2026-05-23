import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Dormitories } from '@/features/dormitories'

const dormitoriesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
  gender: z.string().optional(),
  level: z.string().optional(),
  isActive: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/dormitories/')({
  validateSearch: dormitoriesSearchSchema,
  component: Dormitories,
})
