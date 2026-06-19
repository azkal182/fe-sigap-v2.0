import {
  BookOpen,
  Users,
  CalendarDays,
  CheckCircle2,
  XCircle,
  User,
  GraduationCap,
  Clock,
  Layers,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClassStudents, useClassSchedules } from '../hooks/use-classrooms'
import type { Classroom, Schedule } from '../services/classroom-service'

const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  "Jum'at",
  'Sabtu',
]

type ClassroomDetailPanelProps = {
  classroom: Classroom
}

export function ClassroomDetailPanel({ classroom }: ClassroomDetailPanelProps) {
  return (
    <div className='rounded-lg border bg-card shadow-sm'>
      {/* Panel header */}
      <div className='flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
            <BookOpen size={18} className='text-primary' />
          </div>
          <div>
            <h3 className='text-base leading-tight font-semibold'>
              {classroom.name}
            </h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {classroom.teacher || 'No homeroom teacher'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {classroom.active ? (
            <Badge className='gap-1 border-green-500/30 bg-green-500/15 text-green-600 hover:bg-green-500/15'>
              <CheckCircle2 size={11} />
              Active
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='gap-1 border-red-300 text-red-500'
            >
              <XCircle size={11} />
              Inactive
            </Badge>
          )}
          {classroom.track && (
            <Badge variant='secondary' className='gap-1'>
              <Layers size={11} />
              {classroom.track.name}
            </Badge>
          )}
          {classroom.dormitory && (
            <Badge variant='outline' className='gap-1'>
              <Building2 size={11} />
              {classroom.dormitory.name ??
                `${classroom.dormitory.gender} Lv.${classroom.dormitory.level}`}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='overview' className='px-5 py-4'>
        <TabsList className='mb-4'>
          <TabsTrigger value='overview' className='gap-1.5'>
            <BookOpen size={13} />
            Overview
          </TabsTrigger>
          <TabsTrigger value='students' className='gap-1.5'>
            <Users size={13} />
            Students
          </TabsTrigger>
          <TabsTrigger value='schedules' className='gap-1.5'>
            <CalendarDays size={13} />
            Jadwal
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value='overview'>
          <OverviewTab classroom={classroom} />
        </TabsContent>

        {/* ── Students ── */}
        <TabsContent value='students'>
          <StudentsTab classId={classroom.id} />
        </TabsContent>

        {/* ── Schedules ── */}
        <TabsContent value='schedules'>
          <SchedulesTab classId={classroom.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ classroom }: { classroom: Classroom }) {
  const rows: {
    label: string
    value: React.ReactNode
    icon: React.ReactNode
  }[] = [
    {
      icon: <BookOpen size={14} className='text-muted-foreground' />,
      label: 'Class Name',
      value: classroom.name,
    },
    {
      icon: <User size={14} className='text-muted-foreground' />,
      label: 'Homeroom Teacher',
      value: classroom.teacher || (
        <span className='text-muted-foreground italic'>—</span>
      ),
    },
    {
      icon: <Layers size={14} className='text-muted-foreground' />,
      label: 'Track',
      value: classroom.track ? (
        `${classroom.track.name} (Level ${classroom.track.level})`
      ) : (
        <span className='text-muted-foreground italic'>—</span>
      ),
    },
    {
      icon: <Building2 size={14} className='text-muted-foreground' />,
      label: 'Dormitory',
      value: classroom.dormitory ? (
        `${classroom.dormitory.gender} · Level ${classroom.dormitory.level}`
      ) : (
        <span className='text-muted-foreground italic'>—</span>
      ),
    },
    {
      icon: <CheckCircle2 size={14} className='text-muted-foreground' />,
      label: 'Status',
      value: classroom.active ? (
        <span className='font-medium text-green-600'>Active</span>
      ) : (
        <span className='font-medium text-red-500'>Inactive</span>
      ),
    },
  ]

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='flex items-start gap-3 rounded-md bg-muted/40 px-3 py-2.5'
        >
          <span className='mt-0.5 shrink-0'>{row.icon}</span>
          <div>
            <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
              {row.label}
            </p>
            <p className='mt-0.5 text-sm'>{row.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Students Tab ─────────────────────────────────────────────────────────────

function StudentsTab({ classId }: { classId: string }) {
  const { data, isLoading } = useClassStudents(classId, 'STUDYING')
  const students = data?.data ?? []
  const total = data?.meta?.total ?? 0

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-12 text-center'>
        <GraduationCap size={36} className='text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>
          No active students in this class.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className='mb-3 text-xs text-muted-foreground'>
        Showing <span className='font-semibold text-foreground'>{total}</span>{' '}
        active student{total !== 1 ? 's' : ''}
      </p>
      <div className='overflow-hidden rounded-md border'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b bg-muted/50 text-left text-xs text-muted-foreground'>
              <th className='px-3 py-2 font-medium'>#</th>
              <th className='px-3 py-2 font-medium'>NIS</th>
              <th className='px-3 py-2 font-medium'>Name</th>
              <th className='px-3 py-2 font-medium'>Gender</th>
              <th className='px-3 py-2 font-medium'>Since</th>
            </tr>
          </thead>
          <tbody>
            {students.map((sh, idx) => (
              <tr
                key={sh.id}
                className={cn(
                  'border-b transition-colors last:border-0 hover:bg-muted/40',
                  idx % 2 === 0 ? '' : 'bg-muted/20'
                )}
              >
                <td className='px-3 py-2 text-muted-foreground'>{idx + 1}</td>
                <td className='px-3 py-2 font-mono text-xs'>
                  {sh.student?.nis ?? '—'}
                </td>
                <td className='px-3 py-2 font-medium'>
                  {sh.student?.name ?? '—'}
                </td>
                <td className='px-3 py-2'>
                  {sh.student?.gender ? (
                    <Badge variant='outline' className='h-5 px-1.5 text-[10px]'>
                      {sh.student.gender}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td className='px-3 py-2 text-xs text-muted-foreground'>
                  {sh.startDate
                    ? new Date(sh.startDate).toLocaleDateString('id-ID')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Schedules Tab ────────────────────────────────────────────────────────────

function SchedulesTab({ classId }: { classId: string }) {
  const { data, isLoading } = useClassSchedules(classId)
  const schedules = data?.data ?? []

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-12 text-center'>
        <CalendarDays size={36} className='text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>
          No active schedules for this class.
        </p>
      </div>
    )
  }

  // Group schedules by day of week
  const grouped = DAY_NAMES.reduce<Record<number, Schedule[]>>((acc, _, i) => {
    const daySchedules = schedules.filter((s) => s.dayOfWeek === i)
    if (daySchedules.length > 0) acc[i] = daySchedules
    return acc
  }, {})

  return (
    <div className='space-y-4'>
      {Object.entries(grouped).map(([day, daySchedules]) => (
        <div key={day}>
          <div className='mb-2 flex items-center gap-2'>
            <CalendarDays size={13} className='text-primary' />
            <span className='text-xs font-semibold tracking-wide text-primary uppercase'>
              {DAY_NAMES[Number(day)]}
            </span>
            <Separator className='flex-1' />
          </div>
          <div className='space-y-1.5'>
            {daySchedules
              .sort(
                (a, b) =>
                  (a.scheduleSlot?.slot ?? 0) - (b.scheduleSlot?.slot ?? 0)
              )
              .map((s) => (
                <ScheduleRow key={s.id} schedule={s} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ScheduleRow({ schedule }: { schedule: Schedule }) {
  const slot = schedule.scheduleSlot
  return (
    <div className='flex items-center gap-3 rounded-md border px-3 py-2'>
      {/* Slot / time */}
      <div className='flex w-20 shrink-0 flex-col items-center justify-center rounded bg-muted/60 px-2 py-1 text-center'>
        {slot ? (
          <>
            <span className='text-[10px] font-semibold text-muted-foreground'>
              Slot {slot.slot}
            </span>
            <span className='text-[10px] text-muted-foreground'>
              {slot.startTime}–{slot.endTime}
            </span>
          </>
        ) : (
          <Clock size={13} className='text-muted-foreground' />
        )}
      </div>

      {/* Subject */}
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>
          {schedule.subject?.name ?? 'Unknown subject'}
        </p>
        <p className='truncate text-xs text-muted-foreground'>
          {schedule.teacher?.name ?? 'Unknown teacher'}
        </p>
      </div>
    </div>
  )
}
