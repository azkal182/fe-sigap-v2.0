'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useDormitories } from '@/features/users/hooks/use-users'
import { useCreateTeacher, useUpdateTeacher } from '../hooks/use-teachers'
import type { Teacher } from '../services/teacher-service'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  dormitoryIds: z.array(z.string()),
  isActive: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

type TeacherActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher?: Teacher
}

export function TeacherActionDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherActionDialogProps) {
  const isEdit = !!teacher
  const create = useCreateTeacher()
  const update = useUpdateTeacher()

  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', phone: '', dormitoryIds: [], isActive: true },
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && teacher) {
      form.reset({
        name: teacher.name,
        phone: teacher.phone ?? '',
        dormitoryIds: teacher.dormitories?.map((d) => d.id) ?? [],
        isActive: teacher.isActive,
      })
    } else {
      form.reset({ name: '', phone: '', dormitoryIds: [], isActive: true })
    }
  }, [open, isEdit, teacher])

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone || undefined,
      dormitoryIds: values.dormitoryIds,
    }
    try {
      if (isEdit) {
        await update.mutateAsync({
          id: teacher!.id,
          data: { ...payload, isActive: values.isActive },
        })
        toast.success('Teacher updated.')
      } else {
        await create.mutateAsync(payload)
        toast.success('Teacher created.')
      }
      onOpenChange(false)
    } catch {
      // handled by interceptor
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update teacher information and dormitory assignments.'
              : 'Create a new teacher and assign to dormitories.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Full name…' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone
                    <span className='ms-1 text-xs font-normal text-muted-foreground'>
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='08xxxxxxxxxx' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dormitories — checkbox list */}
            <FormField
              control={form.control}
              name='dormitoryIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dormitories</FormLabel>
                  {isLoadingDorm ? (
                    <div className='space-y-2'>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className='h-5 w-full' />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className='max-h-44 rounded-md border p-3'>
                      <div className='space-y-2'>
                        {dormitories.map((d) => (
                          <div key={d.id} className='flex items-center gap-2.5'>
                            <Checkbox
                              id={`dorm-${d.id}`}
                              checked={field.value.includes(d.id)}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, d.id]
                                    : field.value.filter((v) => v !== d.id)
                                )
                              }}
                            />
                            <label
                              htmlFor={`dorm-${d.id}`}
                              className='cursor-pointer text-sm leading-none'
                            >
                              {d.name}
                              <span className='ms-1.5 text-xs text-muted-foreground'>
                                ({d.gender} · Lv.{d.level})
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* isActive — only in edit mode */}
            {isEdit && (
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <FormLabel className='text-sm font-medium'>Active</FormLabel>
                      <p className='text-xs text-muted-foreground'>
                        Inactive teachers cannot be assigned to schedules
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className='pt-2'>
              <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Save Changes' : 'Create Teacher'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
