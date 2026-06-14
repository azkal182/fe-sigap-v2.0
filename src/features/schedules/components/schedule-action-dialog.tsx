'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDormitories } from '@/features/users/hooks/use-users'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useSubjects } from '@/features/subjects/hooks/use-subjects'
import {
  useTeachersByDormitory,
  useScheduleSlotsByDormitory,
  useCreateSchedule,
  useUpdateSchedule,
} from '../hooks/use-schedules'
import type { Schedule } from '../services/schedule-service'

const DAY_OPTIONS = [
  { value: '1', label: 'Senin (Monday)' },
  { value: '2', label: 'Selasa (Tuesday)' },
  { value: '3', label: 'Rabu (Wednesday)' },
  { value: '4', label: 'Kamis (Thursday)' },
  { value: '5', label: "Jum'at (Friday)" },
  { value: '6', label: 'Sabtu (Saturday)' },
  { value: '0', label: 'Minggu (Sunday)' },
]

const formSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  scheduleSlotId: z.string().min(1, 'Time slot is required'),
  dayOfWeek: z.string().min(1, 'Day is required'),
})

type FormValues = z.infer<typeof formSchema>

type ScheduleActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: Schedule
  /** Pre-fill from active page filter */
  defaultClassId?: string
  defaultDormitoryId?: string
}

export function ScheduleActionDialog({
  open,
  onOpenChange,
  schedule,
  defaultClassId,
  defaultDormitoryId,
}: ScheduleActionDialogProps) {
  const isEdit = !!schedule
  const createSchedule = useCreateSchedule()
  const updateSchedule = useUpdateSchedule()

  // ── Internal dormitory state (UI helper — not sent to API) ──────────────────
  // When editing, derive dormitory from schedule.class.dormitoryId
  const editDormitoryId = isEdit ? schedule?.class?.dormitoryId : undefined

  const [selectedDormitoryId, setSelectedDormitoryId] = useState<string>(
    editDormitoryId ?? defaultDormitoryId ?? ''
  )

  // ── Form ────────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: defaultClassId ?? '',
      subjectId: '',
      teacherId: '',
      scheduleSlotId: '',
      dayOfWeek: '',
    },
  })

  // ── Reference data ──────────────────────────────────────────────────────────
  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const { data: classesData, isLoading: isLoadingClasses } = useClassrooms({
    dormitoryId: selectedDormitoryId || undefined,
    active: true,
    limit: 100,
    includeDetails: true,
  })
  const classes = classesData?.data ?? []

  const { data: subjectsData } = useSubjects({
    dormitoryId: selectedDormitoryId || undefined,
    limit: 100,
    includeDetails: true,
  })
  const subjects = subjectsData?.data ?? []

  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachersByDormitory(
    selectedDormitoryId || undefined
  )
  const teachers = teachersData?.data ?? []

  const { data: slotsData, isLoading: isLoadingSlots } = useScheduleSlotsByDormitory(
    selectedDormitoryId || undefined
  )
  const slots = slotsData?.data ?? []

  // ── Sync form state when dialog opens ───────────────────────────────────────
  useEffect(() => {
    if (!open) return

    if (isEdit && schedule) {
      // Edit mode: restore all values from existing schedule
      const dormId = schedule.class?.dormitoryId ?? defaultDormitoryId ?? ''
      setSelectedDormitoryId(dormId)
      form.reset({
        classId: schedule.classId,
        subjectId: schedule.subjectId,
        teacherId: schedule.teacherId,
        scheduleSlotId: schedule.scheduleSlotId,
        dayOfWeek: String(schedule.dayOfWeek),
      })
    } else {
      // Create mode: use active filter as defaults
      setSelectedDormitoryId(defaultDormitoryId ?? '')
      form.reset({
        classId: defaultClassId ?? '',
        subjectId: '',
        teacherId: '',
        scheduleSlotId: '',
        dayOfWeek: '',
      })
    }
  }, [open, isEdit, schedule, defaultClassId, defaultDormitoryId])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDormitoryChange = (dormId: string) => {
    setSelectedDormitoryId(dormId)
    // Reset class when dormitory changes
    form.setValue('classId', '')
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateSchedule.mutateAsync({
          id: schedule!.id,
          data: {
            classId: values.classId,
            subjectId: values.subjectId,
            teacherId: values.teacherId,
            scheduleSlotId: values.scheduleSlotId,
            dayOfWeek: Number(values.dayOfWeek),
          },
        })
        toast.success('Schedule updated (new revision created).')
      } else {
        await createSchedule.mutateAsync({
          classId: values.classId,
          subjectId: values.subjectId,
          teacherId: values.teacherId,
          scheduleSlotId: values.scheduleSlotId,
          dayOfWeek: Number(values.dayOfWeek),
          validFrom: new Date().toISOString(),
        })
        toast.success('Schedule created.')
      }
      onOpenChange(false)
    } catch {
      // error toast handled by axios interceptor
    }
  }

  const isPending = createSchedule.isPending || updateSchedule.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Editing creates a new revision — the previous schedule is archived.'
              : 'Create a new schedule entry for a class.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>

            {/* ── Dormitory helper (UI only, not submitted) ── */}
            <div className='flex flex-col gap-1.5'>
              <Label className='text-sm font-medium'>
                Dormitory
                <span className='ms-1.5 text-xs font-normal text-muted-foreground'>
                  (for filtering class list)
                </span>
              </Label>
              {isLoadingDorm ? (
                <Skeleton className='h-9 w-full' />
              ) : (
                <Select
                  value={selectedDormitoryId}
                  onValueChange={handleDormitoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select dormitory…' />
                  </SelectTrigger>
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
              )}
            </div>

            {/* ── Class (nested after dormitory) ── */}
            <FormField
              control={form.control}
              name='classId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedDormitoryId || isLoadingClasses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedDormitoryId
                              ? 'Select dormitory first'
                              : isLoadingClasses
                              ? 'Loading…'
                              : 'Select class…'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                          {c.track && (
                            <span className='ms-1.5 text-xs text-muted-foreground'>
                              · {c.track.name}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Day of Week + Time Slot (side by side) ── */}
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='dayOfWeek'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select day…' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DAY_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='scheduleSlotId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedDormitoryId || isLoadingSlots}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedDormitoryId
                                ? 'Select dormitory first'
                                : isLoadingSlots
                                ? 'Loading…'
                                : 'Select slot…'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {slots.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            Slot {s.slot} — {s.startTime}–{s.endTime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Subject ── */}
            <FormField
              control={form.control}
              name='subjectId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedDormitoryId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedDormitoryId ? 'Select dormitory first' : 'Select subject…'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                          {s.track && (
                            <span className='ms-1.5 text-xs text-muted-foreground'>
                              · {s.track.name}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Teacher ── */}
            <FormField
              control={form.control}
              name='teacherId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedDormitoryId || isLoadingTeachers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedDormitoryId
                              ? 'Select dormitory first'
                              : isLoadingTeachers
                              ? 'Loading…'
                              : 'Select teacher…'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-2'>
              <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Save Revision' : 'Create Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
