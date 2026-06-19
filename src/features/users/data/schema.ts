import { z } from 'zod'

const _userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  isActive: z.boolean().optional(),
  role: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  createdAt: z.string().optional(),
})

export type User = z.infer<typeof _userSchema>
