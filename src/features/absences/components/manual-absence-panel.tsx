'use client'

import { useState } from 'react'
import { AlertCircle, CalendarDays } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useClassrooms,
  useClassSchedules,
} from '@/features/classrooms/hooks/use-classrooms'
import type {
  Classroom,
  Schedule,
} from '@/features/classrooms/services/classroom-service'
import { useDormitories } from '@/features/users/hooks/use-users'
import type { Dormitory } from '@/features/users/services/permission-service'
import { useClassroomDailyAbsence } from '../hooks/use-absences'
import type { CurrentAbsenceSession } from '../services/absence-service'
import { getJakartaDayOfWeek, getTodayInJakarta } from '../utils/absence-utils'
import { AbsenceSessionBanner } from './absence-session-banner'
import { AbsenceSessionContent } from './absence-session-content'

interface ManualAbsenceFilter {
  dormitoryId: string | undefined
  classId: string | undefined
  scheduleId: string | undefined
  dormitory: Dormitory | undefined
  classroom: Classroom | undefined
  schedule: Schedule | undefined
}

const INITIAL_FILTER: ManualAbsenceFilter = {
  dormitoryId: undefined,
  classId: undefined,
  scheduleId: undefined,
  dormitory: undefined,
  classroom: undefined,
  schedule: undefined,
}

export function ManualAbsencePanel() {
  const today = getTodayInJakarta()
  const todayDayOfWeek = getJakartaDayOfWeek()
  const [filter, setFilter] = useManualAbsenceFilter()

  const queryParams =
    filter.classId && filter.schedule?.scheduleSlot?.id
      ? {
          classId: filter.classId,
          scheduleSlotId: filter.schedule.scheduleSlot.id,
          absentDate: today,
        }
      : undefined

  const classroomDailyQuery = useClassroomDailyAbsence(queryParams)

  const session =
    filter.classroom &&
    filter.schedule?.scheduleSlot &&
    classroomDailyQuery.data
      ? toManualAbsenceSession({
          classroom: filter.classroom,
          schedule: filter.schedule,
          absentDate: today,
          dayOfWeek: todayDayOfWeek,
          items: classroomDailyQuery.data.items,
        })
      : null

  return (
    <div className='space-y-5'>
      <ManualAbsenceFilterBar
        value={filter}
        todayDayOfWeek={todayDayOfWeek}
        onChange={setFilter}
      />

      {!filter.classId || !filter.schedule ? (
        <Alert>
          <CalendarDays />
          <AlertTitle>Pilih kelas dan slot jadwal</AlertTitle>
          <AlertDescription>
            Mode manual menggunakan tanggal hari ini ({today}) sesuai aturan API
            absensi.
          </AlertDescription>
        </Alert>
      ) : null}

      {classroomDailyQuery.isLoading && (
        <div className='space-y-4'>
          <Skeleton className='h-36 rounded-lg' />
          <Skeleton className='h-80 rounded-lg' />
        </div>
      )}

      {classroomDailyQuery.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertTitle>Gagal memuat roster absensi</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(
              classroomDailyQuery.error,
              'Silakan periksa pilihan kelas dan slot jadwal.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {session && !classroomDailyQuery.isLoading && (
        <>
          <AbsenceSessionBanner session={session} />
          <AbsenceSessionContent
            key={`${session.class.id}:${session.scheduleSlot.id}:${today}`}
            session={session}
          />
        </>
      )}
    </div>
  )
}

function useManualAbsenceFilter() {
  return useState<ManualAbsenceFilter>(INITIAL_FILTER)
}

function ManualAbsenceFilterBar({
  value,
  todayDayOfWeek,
  onChange,
}: {
  value: ManualAbsenceFilter
  todayDayOfWeek: number
  onChange: (filter: ManualAbsenceFilter) => void
}) {
  const { data: dormitoriesData, isLoading: isLoadingDormitories } =
    useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const { data: classesData, isLoading: isLoadingClassrooms } = useClassrooms({
    dormitoryId: value.dormitoryId,
    active: true,
    limit: 100,
    includeDetails: true,
  })
  const classrooms = classesData?.data ?? []

  const { data: schedulesData, isLoading: isLoadingSchedules } =
    useClassSchedules(value.classId)
  const schedules = (schedulesData?.data ?? []).filter(
    (schedule) => schedule.dayOfWeek === todayDayOfWeek
  )

  const handleDormitoryChange = (dormitoryId: string) => {
    const dormitory = dormitories.find((item) => item.id === dormitoryId)
    onChange({
      dormitoryId,
      classId: undefined,
      scheduleId: undefined,
      dormitory,
      classroom: undefined,
      schedule: undefined,
    })
  }

  const handleClassChange = (classId: string) => {
    const classroom = classrooms.find((item) => item.id === classId)
    onChange({
      ...value,
      classId,
      scheduleId: undefined,
      classroom,
      schedule: undefined,
    })
  }

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = schedules.find((item) => item.id === scheduleId)
    onChange({
      ...value,
      scheduleId,
      schedule,
    })
  }

  return (
    <div className='flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4'>
      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Asrama</Label>
        {isLoadingDormitories ? (
          <Skeleton className='h-9 w-48' />
        ) : (
          <Select
            value={value.dormitoryId ?? ''}
            onValueChange={handleDormitoryChange}
          >
            <SelectTrigger className='h-9 w-48'>
              <SelectValue placeholder='Pilih asrama' />
            </SelectTrigger>
            <SelectContent>
              {dormitories.map((dormitory) => (
                <SelectItem key={dormitory.id} value={dormitory.id}>
                  <span>{dormitory.name}</span>
                  <span className='ms-1.5 text-xs text-muted-foreground'>
                    ({dormitory.gender} · Lv.{dormitory.level})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Kelas</Label>
        {isLoadingClassrooms ? (
          <Skeleton className='h-9 w-52' />
        ) : (
          <Select
            value={value.classId ?? ''}
            disabled={!value.dormitoryId}
            onValueChange={handleClassChange}
          >
            <SelectTrigger className='h-9 w-52'>
              <SelectValue placeholder='Pilih kelas' />
            </SelectTrigger>
            <SelectContent>
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  <span>{classroom.name}</span>
                  {classroom.track && (
                    <span className='ms-1.5 text-xs text-muted-foreground'>
                      · {classroom.track.name}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Slot Jadwal</Label>
        {isLoadingSchedules ? (
          <Skeleton className='h-9 w-64' />
        ) : (
          <Select
            value={value.scheduleId ?? ''}
            disabled={!value.classId}
            onValueChange={handleScheduleChange}
          >
            <SelectTrigger className='h-9 w-64'>
              <SelectValue placeholder='Pilih slot hari ini' />
            </SelectTrigger>
            <SelectContent>
              {schedules.map((schedule) => (
                <SelectItem key={schedule.id} value={schedule.id}>
                  Slot {schedule.scheduleSlot?.slot},{' '}
                  {schedule.scheduleSlot?.startTime}-
                  {schedule.scheduleSlot?.endTime}
                  {schedule.subject && (
                    <span className='ms-1.5 text-xs text-muted-foreground'>
                      · {schedule.subject.name}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

function toManualAbsenceSession({
  classroom,
  schedule,
  absentDate,
  dayOfWeek,
  items,
}: {
  classroom: Classroom
  schedule: Schedule
  absentDate: string
  dayOfWeek: number
  items: CurrentAbsenceSession['items']
}): CurrentAbsenceSession {
  return {
    absentDate,
    currentTime: '',
    dayOfWeek,
    schedule: {
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
    },
    class: {
      id: classroom.id,
      name: classroom.name,
    },
    dormitory: {
      id: classroom.dormitory?.id ?? classroom.dormitoryId,
      name: classroom.dormitory?.name ?? null,
      level: classroom.dormitory?.level ?? null,
      gender: classroom.dormitory?.gender ?? null,
    },
    track: {
      id: classroom.track?.id ?? classroom.trackId,
      name: classroom.track?.name ?? null,
      level: classroom.track?.level ?? null,
    },
    subject: {
      id: schedule.subject?.id ?? schedule.subjectId,
      name: schedule.subject?.name ?? 'Mata pelajaran',
    },
    teacher: {
      id: schedule.teacher?.id ?? schedule.teacherId,
      name: schedule.teacher?.name ?? classroom.teacher,
    },
    scheduleSlot: {
      id: schedule.scheduleSlot?.id ?? schedule.scheduleSlotId,
      slot: schedule.scheduleSlot?.slot ?? 0,
      startTime: schedule.scheduleSlot?.startTime ?? '-',
      endTime: schedule.scheduleSlot?.endTime ?? '-',
    },
    items,
  }
}
