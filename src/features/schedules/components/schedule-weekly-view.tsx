'use client'

import { useState } from 'react'
import {
  CalendarDays,
  Plus,
  Pencil,
  PowerOff,
  Loader2,
  Clock,
  BookMarked,
  User,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSchedules } from '../hooks/use-schedules'
import { ScheduleActionDialog } from './schedule-action-dialog'
import { ScheduleDeactivateDialog } from './schedule-deactivate-dialog'
import type { ScheduleFilter } from './schedule-filter-bar'
import type { Schedule } from '../services/schedule-service'

// Indonesia day names ordered Mon→Sun for school schedule
const DAYS: { value: number; label: string; short: string }[] = [
  { value: 1, label: 'Senin', short: 'Sen' },
  { value: 2, label: 'Selasa', short: 'Sel' },
  { value: 3, label: 'Rabu', short: 'Rab' },
  { value: 4, label: 'Kamis', short: 'Kam' },
  { value: 5, label: "Jum'at", short: "Jum" },
  { value: 6, label: 'Sabtu', short: 'Sab' },
  { value: 0, label: 'Minggu', short: 'Min' },
]

type ScheduleWeeklyViewProps = {
  filter: ScheduleFilter
}

export function ScheduleWeeklyView({ filter }: ScheduleWeeklyViewProps) {
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    schedule?: Schedule
  }>({ open: false })
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean
    schedule?: Schedule
  }>({ open: false })

  const hasFilter = !!filter.dormitoryId || !!filter.classId

  const { data, isLoading, isFetching } = useSchedules(
    hasFilter
      ? {
          classId: filter.classId || undefined,
          dormitoryId: filter.classId ? undefined : filter.dormitoryId, // dormitoryId only when no specific class selected
          active: true,
          limit: 100,
        }
      : undefined,
    hasFilter
  )

  const schedules = data?.data ?? []
  const total = data?.meta?.total ?? 0

  // Group by dayOfWeek
  const grouped = DAYS.reduce<Record<number, Schedule[]>>((acc, day) => {
    const daySchedules = schedules
      .filter((s) => s.dayOfWeek === day.value)
      .sort((a, b) => (a.scheduleSlot?.slot ?? 0) - (b.scheduleSlot?.slot ?? 0))
    if (daySchedules.length > 0) acc[day.value] = daySchedules
    return acc
  }, {})

  const hasDays = Object.keys(grouped).length > 0

  return (
    <>
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle className='flex items-center gap-2 text-base'>
                <CalendarDays size={16} />
                Weekly Schedule
                {total > 0 && (
                  <Badge variant='secondary' className='ms-1'>
                    {total} entries
                  </Badge>
                )}
                {isFetching && !isLoading && (
                  <Loader2 size={13} className='animate-spin text-muted-foreground' />
                )}
              </CardTitle>
              <CardDescription className='mt-0.5'>
                {filter.classroom
                  ? `Active schedule for ${filter.classroom.name}`
                  : filter.dormitory
                  ? `All classes in ${filter.dormitory.name}`
                  : 'Select a dormitory to view schedules'}
              </CardDescription>
            </div>

            <Button
              size='sm'
              className='h-8 gap-1.5'
              onClick={() => setActionDialog({ open: true })}
            >
              <Plus size={14} />
              Add Schedule
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <WeeklyViewSkeleton />
          ) : !filter.dormitory ? (
            <EmptyState message='Select a dormitory to view schedules.' />
          ) : !hasDays ? (
            <EmptyState
              message='No active schedules found.'
              action={
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-1.5'
                  onClick={() => setActionDialog({ open: true })}
                >
                  <Plus size={13} />
                  Add Schedule
                </Button>
              }
            />
          ) : (
            <div className='space-y-6'>
              {DAYS.filter((d) => grouped[d.value]).map((day) => (
                <div key={day.value}>
                  {/* Day header */}
                  <div className='mb-3 flex items-center gap-3'>
                    <div className='flex h-7 w-14 items-center justify-center rounded-md bg-primary/10'>
                      <span className='text-xs font-bold text-primary'>{day.short}</span>
                    </div>
                    <span className='text-sm font-semibold'>{day.label}</span>
                    <Badge variant='outline' className='h-5 px-1.5 text-[10px]'>
                      {grouped[day.value].length} slot
                    </Badge>
                    <Separator className='flex-1' />
                  </div>

                  {/* Schedule entries */}
                  <div className='ms-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                    {grouped[day.value].map((s) => (
                      <ScheduleCard
                        key={s.id}
                        schedule={s}
                        onEdit={() => setActionDialog({ open: true, schedule: s })}
                        onDeactivate={() => setDeactivateDialog({ open: true, schedule: s })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ScheduleActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((s) => ({ ...s, open }))}
        schedule={actionDialog.schedule}
        defaultClassId={filter.classId}
        defaultDormitoryId={filter.dormitoryId}
      />

      {deactivateDialog.schedule && (
        <ScheduleDeactivateDialog
          open={deactivateDialog.open}
          onOpenChange={(open) => setDeactivateDialog((s) => ({ ...s, open }))}
          schedule={deactivateDialog.schedule}
        />
      )}
    </>
  )
}

// ─── Schedule Card ────────────────────────────────────────────────────────────

function ScheduleCard({
  schedule,
  onEdit,
  onDeactivate,
}: {
  schedule: Schedule
  onEdit: () => void
  onDeactivate: () => void
}) {
  const slot = schedule.scheduleSlot

  return (
    <div className='group relative flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md'>
      {/* Slot time pill */}
      {slot && (
        <div className='flex items-center gap-1.5'>
          <Clock size={12} className='shrink-0 text-muted-foreground' />
          <span className='text-[11px] font-semibold text-muted-foreground'>
            Slot {slot.slot} · {slot.startTime}–{slot.endTime}
          </span>
        </div>
      )}

      {/* Subject */}
      <div className='flex items-start gap-1.5'>
        <BookMarked size={13} className='mt-0.5 shrink-0 text-primary' />
        <p className='text-sm font-semibold leading-tight'>
          {schedule.subject?.name ?? 'Unknown subject'}
        </p>
      </div>

      {/* Teacher */}
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <User size={11} className='shrink-0' />
        <span className='truncate'>{schedule.teacher?.name ?? '—'}</span>
      </div>

      {/* Class — shown only in "all classes" view */}
      {schedule.class && (
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <BookOpen size={11} className='shrink-0' />
          <span className='truncate'>{schedule.class.name}</span>
        </div>
      )}

      {/* Actions */}
      <div className='mt-1 flex items-center gap-1'>
        <Button
          size='sm'
          variant='outline'
          className='h-6 gap-1 px-2 text-[11px]'
          onClick={onEdit}
        >
          <Pencil size={10} />
          Edit
        </Button>
        <Button
          size='sm'
          variant='outline'
          className='h-6 gap-1 px-2 text-[11px] text-destructive hover:text-destructive'
          onClick={onDeactivate}
        >
          <PowerOff size={10} />
          Deactivate
        </Button>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className='flex flex-col items-center gap-3 py-16 text-center'>
      <CalendarDays size={40} className='text-muted-foreground/40' />
      <p className='text-sm text-muted-foreground'>{message}</p>
      {action}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WeeklyViewSkeleton() {
  return (
    <div className='space-y-6'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='animate-pulse'>
          <div className='mb-3 flex items-center gap-3'>
            <div className='h-7 w-14 rounded-md bg-muted' />
            <div className='h-4 w-20 rounded bg-muted' />
            <div className='h-px flex-1 bg-muted' />
          </div>
          <div className='ms-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {[1, 2].map((j) => (
              <div key={j} className='rounded-lg border p-3'>
                <div className='mb-2 h-3 w-24 rounded bg-muted' />
                <div className='mb-1 h-4 w-32 rounded bg-muted' />
                <div className='h-3 w-20 rounded bg-muted' />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
