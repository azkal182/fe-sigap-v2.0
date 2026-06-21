'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useScheduleSlots } from '@/features/schedule-slots/hooks/use-schedule-slots'
import { useDormitories } from '@/features/users/hooks/use-users'
import { useTeacherAttendances } from '../hooks/use-teacher-attendances'
import type {
  TeacherAttendanceListParams,
  TeacherAttendanceStatus,
} from '../services/teacher-attendance-service'
import {
  getTeacherAttendanceStatusLabel,
  getTodayInJakarta,
} from '../utils/teacher-attendance-utils'

const PAGE_SIZE = 15

interface HistoryFilter {
  attendDateFrom: string
  attendDateTo: string
  status: TeacherAttendanceStatus | 'all'
  dormitoryId: string
  scheduleSlotId: string
}

const STATUS_BADGE: Record<TeacherAttendanceStatus, string> = {
  PRESENT: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  SICK: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  PERMIT: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  ABSENT: 'bg-destructive/15 text-destructive',
}

export function TeacherAttendanceHistoryPanel() {
  const today = getTodayInJakarta()
  const firstOfMonth = today.slice(0, 8) + '01'

  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<HistoryFilter>({
    attendDateFrom: firstOfMonth,
    attendDateTo: today,
    status: 'all',
    dormitoryId: '',
    scheduleSlotId: '',
  })

  // ── Reference data ─────────────────────────────────────────────────────────
  const { data: dormitoriesData } = useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const { data: slotsData } = useScheduleSlots(
    filter.dormitoryId
      ? { dormitoryId: filter.dormitoryId, limit: 50 }
      : undefined
  )
  const slots = slotsData?.data ?? []

  // ── Query ──────────────────────────────────────────────────────────────────
  const params = useMemo<TeacherAttendanceListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      sortBy: 'attendDate',
      sortOrder: 'desc',
      includeDetails: true,
      status: filter.status === 'all' ? undefined : filter.status,
      attendDateFrom: filter.attendDateFrom || undefined,
      attendDateTo: filter.attendDateTo || undefined,
      dormitoryId: filter.dormitoryId || undefined,
      scheduleSlotId: filter.scheduleSlotId || undefined,
    }),
    [filter, page]
  )

  const query = useTeacherAttendances(params)
  const records = query.data?.data ?? []
  const meta = query.data?.meta

  const handleFilter = (next: Partial<HistoryFilter>) => {
    setFilter((f) => ({ ...f, ...next }))
    setPage(1)
  }

  return (
    <div className='space-y-5'>
      {/* Filter bar */}
      <div className='flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4'>
        {/* Tanggal mulai */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Tanggal Mulai</Label>
          <Input
            type='date'
            className='h-9 w-44'
            value={filter.attendDateFrom}
            onChange={(e) => handleFilter({ attendDateFrom: e.target.value })}
          />
        </div>

        {/* Tanggal selesai */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>
            Tanggal Selesai
          </Label>
          <Input
            type='date'
            className='h-9 w-44'
            value={filter.attendDateTo}
            onChange={(e) => handleFilter({ attendDateTo: e.target.value })}
          />
        </div>

        {/* Asrama */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Asrama</Label>
          <Select
            value={filter.dormitoryId || 'all'}
            onValueChange={(v) =>
              handleFilter({
                dormitoryId: v === 'all' ? '' : v,
                scheduleSlotId: '',
              })
            }
          >
            <SelectTrigger className='h-9 w-44'>
              <SelectValue placeholder='Semua asrama' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua asrama</SelectItem>
              {dormitories.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Slot */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Slot</Label>
          <Select
            value={filter.scheduleSlotId || 'all'}
            disabled={!filter.dormitoryId}
            onValueChange={(v) =>
              handleFilter({ scheduleSlotId: v === 'all' ? '' : v })
            }
          >
            <SelectTrigger className='h-9 w-44'>
              <SelectValue
                placeholder={
                  !filter.dormitoryId ? 'Pilih asrama dulu' : 'Semua slot'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua slot</SelectItem>
              {slots.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  Slot {s.slot} · {s.startTime}–{s.endTime}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Status</Label>
          <Select
            value={filter.status}
            onValueChange={(v) =>
              handleFilter({ status: v as HistoryFilter['status'] })
            }
          >
            <SelectTrigger className='h-9 w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua status</SelectItem>
              <SelectItem value='PRESENT'>Hadir</SelectItem>
              <SelectItem value='SICK'>Sakit</SelectItem>
              <SelectItem value='PERMIT'>Izin</SelectItem>
              <SelectItem value='ABSENT'>Alpha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error */}
      {query.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertTitle>Gagal memuat riwayat</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(
              query.error,
              'Silakan periksa filter dan coba lagi.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Table card */}
      <div className='rounded-lg border bg-card'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
          <div>
            <h3 className='font-semibold'>Riwayat Absensi Pengajar</h3>
            <p className='text-sm text-muted-foreground'>
              {meta ? `${meta.total} data ditemukan` : 'Memuat data…'}
            </p>
          </div>
        </div>

        {query.isLoading ? (
          <div className='space-y-3 p-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-10 rounded-md' />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className='px-4 py-12 text-center text-sm text-muted-foreground'>
            Belum ada data absensi untuk filter ini.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pengajar</TableHead>
                <TableHead>Kelas / Mapel</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead className='w-24'>Status</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className='whitespace-nowrap'>
                    {new Date(r.attendDate + 'T00:00:00').toLocaleDateString(
                      'id-ID',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>
                      {r.teacher?.name ?? r.teacherId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>
                      {r.schedule?.class?.name ?? '—'}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {r.schedule?.subject?.name ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell className='text-sm'>
                    {r.schedule?.scheduleSlot
                      ? `Slot ${r.schedule.scheduleSlot.slot} · ${r.schedule.scheduleSlot.startTime}–${r.schedule.scheduleSlot.endTime}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}
                    >
                      {getTeacherAttendanceStatusLabel(r.status)}
                    </span>
                  </TableCell>
                  <TableCell className='max-w-52 truncate text-sm text-muted-foreground'>
                    {r.note || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3'>
          <p className='text-sm text-muted-foreground'>
            Halaman {meta?.page ?? page} dari {meta?.totalPages ?? 1}
          </p>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!meta?.hasPrevPage || query.isFetching}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              <ChevronLeft />
              Sebelumnya
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!meta?.hasNextPage || query.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
