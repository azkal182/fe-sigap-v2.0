'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTracksByDormitory } from '@/features/classrooms/hooks/use-classrooms'
import { useDormitories } from '@/features/users/hooks/use-users'
import { useCreateSubject, useUpdateSubject } from '../hooks/use-subjects'
import type { Subject } from '../services/subject-service'

const formSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  dormitoryId: z.string().min(1, 'Please select a dormitory'),
  trackId: z.string().min(1, 'Please select a track'),
})

type FormValues = z.infer<typeof formSchema>

type SubjectActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject?: Subject // undefined = create mode
  defaultDormitoryId?: string
  defaultTrackId?: string
}

export function SubjectActionDialog({
  open,
  onOpenChange,
  subject,
  defaultDormitoryId,
  defaultTrackId,
}: SubjectActionDialogProps) {
  const isEdit = !!subject
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dormitoryId: defaultDormitoryId ?? '',
      trackId: defaultTrackId ?? '',
    },
  })

  const dormitoryId = useWatch({ control: form.control, name: 'dormitoryId' })
  const { data: dormitoriesData } = useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const { data: tracksData, isLoading: isLoadingTracks } = useTracksByDormitory(
    dormitoryId || undefined
  )
  const tracks = tracksData?.data ?? []

  // When switching to edit mode, populate form from subject data
  useEffect(() => {
    if (open) {
      if (isEdit && subject) {
        form.reset({
          name: subject.name,
          dormitoryId: subject.track?.dormitoryId ?? defaultDormitoryId ?? '',
          trackId: subject.trackId,
        })
      } else {
        form.reset({
          name: '',
          dormitoryId: defaultDormitoryId ?? '',
          trackId: defaultTrackId ?? '',
        })
      }
    }
  }, [open, isEdit, subject, defaultDormitoryId, defaultTrackId, form])

  // When dormitory changes, reset trackId
  const handleDormitoryChange = (
    value: string,
    fieldOnChange: (v: string) => void
  ) => {
    fieldOnChange(value)
    form.setValue('trackId', '')
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateSubject.mutateAsync({
          id: subject!.id,
          data: { name: values.name, trackId: values.trackId },
        })
        toast.success(`Subject "${values.name}" updated.`)
      } else {
        await createSubject.mutateAsync({
          name: values.name,
          trackId: values.trackId,
        })
        toast.success(`Subject "${values.name}" created.`)
      }
      onOpenChange(false)
    } catch {
      // error toast handled by axios interceptor
    }
  }

  const isPending = createSubject.isPending || updateSubject.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update subject name or reassign it to a different track.'
              : 'Create a new subject and assign it to a track.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Subject Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Tahsin Al-Quran' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dormitory (to narrow track list) */}
            <FormField
              control={form.control}
              name='dormitoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dormitory</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) =>
                      handleDormitoryChange(v, field.onChange)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select dormitory…' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dormitories.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                          <span className='ms-1.5 text-xs text-muted-foreground'>
                            ({d.gender} · Lv.{d.level})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Track */}
            <FormField
              control={form.control}
              name='trackId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Track</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!dormitoryId || isLoadingTracks}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !dormitoryId
                              ? 'Select dormitory first'
                              : isLoadingTracks
                                ? 'Loading…'
                                : 'Select track…'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tracks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                          <span className='ms-1.5 text-xs text-muted-foreground'>
                            Lv.{t.level}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant='outline'
                type='button'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Save Changes' : 'Create Subject'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
