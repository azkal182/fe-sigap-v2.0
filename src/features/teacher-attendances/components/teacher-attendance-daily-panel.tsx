'use client'

import { useState } from 'react'
import { AlertCircle, Building2, CalendarClock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useScheduleSlots } from '@/features/schedule-slots/hooks/use-schedule-slots'
import { useDormitories } from '@/features/users/hooks/use-users'
import {
  useTeacherAttendanceDailyRoster,
  useUpsertTeacherAttendanceDaily,
} from '../hooks/use-teacher-attendances'
import type { TeacherAttendanceStatus } from '../services/teacher-attendance-service'
import {
  getTodayInJakarta,
  toTeacherAttendanceDraftItems,
  type TeacherAttendanceDraftItem,
} from '../utils/teacher-attendance-utils'
import { TeacherAttendanceRosterTable } from './teacher-attendance-roster-table'

interface DailyFilter {
  dormitoryId: string
  scheduleSlotId: string
  attendDate: string
}

export function TeacherAttendanceDailyPanel() {
  const today = getTodayInJakarta()
  const [filter, setFilter] = useState<DailyFilter>({
    dormitoryId: '',
    scheduleSlotId: '',
    attendDate: today,
  })
  const [submittedFilter, setSubmittedFilter] = useState<DailyFilter | null>(
    null
  )
  const [items, setItems] = useState<TeacherAttendanceDraftItem[]>([])

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({
    limit: 100,
  })
  const dormitories = dormitoriesData?.data ?? []

  const { data: slotsData, isLoading: isLoadingSlots } = useScheduleSlots(
    filter.dormitoryId
      ? { dormitoryId: filter.dormitoryId, limit: 50 }
      : undefined
  )
  const slots = slotsData?.data ?? []

  const rosterParams =
    submittedFilter?.dormitoryId &&
    submittedFilter.scheduleSlotId &&
    submittedFilter.attendDate
      ? submittedFilter
      : undefined

  const rosterQuery = useTeacherAttendanceDailyRoster(rosterParams)
  const upsert = useUpsertTeacherAttendanceDaily()

  // Sync roster data → draft items
  const handleLoad = () => {
    if (!filter.dormitoryId || !filter.scheduleSlotId || !filter.attendDate)
      return
    setSubmittedFilter(filter)
    // items will be loaded via useEffect below
  }

  // When roster data arrives, convert to draft
  const rosterData = rosterQuery.data
  const prevItems = items

  if (
    rosterData &&
    submittedFilter &&
    // Only reset items when the filter changes (not on every re-render)
    (prevItems.length === 0 ||
      (rosterQuery.isRefetching === false && rosterQuery.isFetched))
  ) {
    const newItems = toTeacherAttendanceDraftItems(rosterData.items)
    if (
      JSON.stringify(newItems.map((i) => i.teacherId + i.scheduleId)) !==
      JSON.stringify(prevItems.map((i) => i.teacherId + i.scheduleId))
    ) {
      setItems(newItems)
    }
  }

  const handleChangeStatus = (
    teacherId: string,
    scheduleId: string,
    status: TeacherAttendanceStatus
  ) => {
    setItems((cur) =>
      cur.map((i) =>
        i.teacherId === teacherId && i.scheduleId === scheduleId
          ? { ...i, status }
          : i
      )
    )
  }

  const handleChangeNote = (
    teacherId: string,
    scheduleId: string,
    note: string
  ) => {
    setItems((cur) =>
      cur.map((i) =>
        i.teacherId === teacherId && i.scheduleId === scheduleId
          ? { ...i, note }
          : i
      )
    )
  }

  const handleMarkAllPresent = () => {
    setItems((cur) =>
      cur.map((i) => ({ ...i, status: 'PRESENT' as TeacherAttendanceStatus }))
    )
  }

  const handleSubmit = async () => {
    if (!submittedFilter) return
    try {
      await upsert.mutateAsync({
        dormitoryId: submittedFilter.dormitoryId,
        scheduleSlotId: submittedFilter.scheduleSlotId,
        attendDate: submittedFilter.attendDate,
        items: items.map((i) => ({
          teacherId: i.teacherId,
          scheduleId: i.scheduleId,
          status: i.status,
          note: i.note.trim() || undefined,
        })),
      })
      toast.success('Absensi pengajar berhasil disimpan.')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Gagal menyimpan absensi pengajar.')
      )
    }
  }

  const selectedDorm = dormitories.find((d) => d.id === filter.dormitoryId)
  const selectedSlot = slots.find((s) => s.id === filter.scheduleSlotId)

  return (
    <div className='space-y-5'>
      {/* Filter card */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Building2 size={15} className='text-muted-foreground' />
            Pilih Sesi Absensi
          </CardTitle>
          <CardDescription>
            Pilih asrama, slot jadwal, dan tanggal untuk memuat roster pengajar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap items-end gap-4'>
            {/* Asrama */}
            <div className='flex flex-col gap-1.5'>
              <Label className='text-xs text-muted-foreground'>Asrama</Label>
              {isLoadingDorm ? (
                <Skeleton className='h-9 w-44' />
              ) : (
                <Select
                  value={filter.dormitoryId}
                  onValueChange={(v) =>
                    setFilter({ ...filter, dormitoryId: v, scheduleSlotId: '' })
                  }
                >
                  <SelectTrigger className='h-9 w-44'>
                    <SelectValue placeholder='Pilih asrama' />
                  </SelectTrigger>
                  <SelectContent>
                    {dormitories.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Slot */}
            <div className='flex flex-col gap-1.5'>
              <Label className='text-xs text-muted-foreground'>
                Slot Jadwal
              </Label>
              {isLoadingSlots && filter.dormitoryId ? (
                <Skeleton className='h-9 w-44' />
              ) : (
                <Select
                  value={filter.scheduleSlotId}
                  disabled={!filter.dormitoryId || slots.length === 0}
                  onValueChange={(v) =>
                    setFilter({ ...filter, scheduleSlotId: v })
                  }
                >
                  <SelectTrigger className='h-9 w-44'>
                    <SelectValue
                      placeholder={
                        !filter.dormitoryId ? 'Pilih asrama dulu' : 'Pilih slot'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        Slot {s.slot} · {s.startTime}–{s.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Tanggal */}
            <div className='flex flex-col gap-1.5'>
              <Label className='text-xs text-muted-foreground'>Tanggal</Label>
              <Input
                type='date'
                className='h-9 w-44'
                value={filter.attendDate}
                onChange={(e) =>
                  setFilter({ ...filter, attendDate: e.target.value })
                }
              />
            </div>

            <Button
              className='h-9 self-end'
              disabled={
                !filter.dormitoryId ||
                !filter.scheduleSlotId ||
                !filter.attendDate
              }
              onClick={handleLoad}
            >
              {rosterQuery.isFetching ? (
                <Loader2 className='animate-spin' />
              ) : (
                <CalendarClock size={14} />
              )}
              Tampilkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session context banner */}
      {submittedFilter && selectedDorm && selectedSlot && (
        <div className='flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm'>
          <Badge variant='secondary'>
            {new Date(
              submittedFilter.attendDate + 'T00:00:00'
            ).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
          <span className='text-muted-foreground'>
            {selectedDorm.name} · Slot {selectedSlot.slot} (
            {selectedSlot.startTime}–{selectedSlot.endTime})
          </span>
          {rosterQuery.data && (
            <Badge variant='outline' className='ms-auto'>
              {rosterQuery.data.total} pengajar terjadwal
            </Badge>
          )}
        </div>
      )}

      {/* Error state */}
      {rosterQuery.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertTitle>Gagal memuat roster</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(
              rosterQuery.error,
              'Periksa filter dan coba lagi.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Roster skeleton */}
      {rosterQuery.isLoading && (
        <div className='space-y-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-14 rounded-lg' />
          ))}
        </div>
      )}

      {/* No filter yet */}
      {!submittedFilter && (
        <div className='rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground'>
          Pilih asrama, slot, dan tanggal lalu klik <strong>Tampilkan</strong>{' '}
          untuk memuat roster pengajar.
        </div>
      )}

      {/* Roster table */}
      {submittedFilter && !rosterQuery.isLoading && items.length >= 0 && (
        <TeacherAttendanceRosterTable
          items={items}
          isSubmitting={upsert.isPending}
          onChangeStatus={handleChangeStatus}
          onChangeNote={handleChangeNote}
          onMarkAllPresent={handleMarkAllPresent}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
