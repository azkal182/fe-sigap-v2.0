'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
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
import { useDormitories } from '@/features/users/hooks/use-users'
import {
  useCreateScheduleSlot,
  useUpdateScheduleSlot,
} from '../hooks/use-schedule-slots'
import type { ScheduleSlot } from '../services/schedule-slot-service'

// HH:mm pattern
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

const formSchema = z
  .object({
    dormitoryId: z.string().min(1, 'Dormitory is required'),
    slot: z
      .string()
      .min(1, 'Slot number is required')
      .refine((v) => Number(v) > 0, 'Must be a positive number'),
    startTime: z.string().regex(timeRegex, 'Format must be HH:mm'),
    endTime: z.string().regex(timeRegex, 'Format must be HH:mm'),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

type FormValues = z.infer<typeof formSchema>

type ScheduleSlotActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot?: ScheduleSlot
  defaultDormitoryId?: string
}

export function ScheduleSlotActionDialog({
  open,
  onOpenChange,
  slot,
  defaultDormitoryId,
}: ScheduleSlotActionDialogProps) {
  const isEdit = !!slot
  const create = useCreateScheduleSlot()
  const update = useUpdateScheduleSlot()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dormitoryId: defaultDormitoryId ?? '',
      slot: '',
      startTime: '',
      endTime: '',
    },
  })

  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({
    limit: 100,
  })
  const dormitories = dormitoriesData?.data ?? []

  useEffect(() => {
    if (!open) return
    if (isEdit && slot) {
      form.reset({
        dormitoryId: slot.dormitoryId,
        slot: String(slot.slot),
        startTime: slot.startTime,
        endTime: slot.endTime,
      })
    } else {
      form.reset({
        dormitoryId: defaultDormitoryId ?? '',
        slot: '',
        startTime: '',
        endTime: '',
      })
    }
  }, [open, isEdit, slot, defaultDormitoryId, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({
          id: slot!.id,
          data: {
            dormitoryId: values.dormitoryId,
            slot: Number(values.slot),
            startTime: values.startTime,
            endTime: values.endTime,
          },
        })
        toast.success('Schedule slot updated.')
      } else {
        await create.mutateAsync({
          dormitoryId: values.dormitoryId,
          slot: Number(values.slot),
          startTime: values.startTime,
          endTime: values.endTime,
        })
        toast.success('Schedule slot created.')
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
          <DialogTitle>
            {isEdit ? 'Edit Schedule Slot' : 'Add Schedule Slot'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the slot number and time range for this schedule slot.'
              : 'Define a new time slot for a dormitory schedule.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Dormitory */}
            <FormField
              control={form.control}
              name='dormitoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dormitory</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingDorm}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingDorm ? 'Loading…' : 'Select dormitory…'
                          }
                        />
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

            {/* Slot number */}
            <FormField
              control={form.control}
              name='slot'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slot Number</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      placeholder='e.g. 1'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time range side by side */}
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='startTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                variant='outline'
                type='button'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Save Changes' : 'Create Slot'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
