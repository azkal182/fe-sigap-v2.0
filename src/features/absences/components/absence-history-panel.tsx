'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
import { useAbsences } from '../hooks/use-absences'
import type {
  AbsenceListParams,
  AbsenceRecord,
  AbsenceStatus,
} from '../services/absence-service'
import {
  getAbsenceStatusLabel,
  getTodayInJakarta,
} from '../utils/absence-utils'

const PAGE_SIZE = 10

interface HistoryFilter {
  absentDateFrom: string
  absentDateTo: string
  status: AbsenceStatus | 'all'
}

export function AbsenceHistoryPanel() {
  const today = getTodayInJakarta()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<HistoryFilter>({
    absentDateFrom: today,
    absentDateTo: today,
    status: 'all',
  })

  const params = useMemo<AbsenceListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      sortBy: 'absentDate',
      sortOrder: 'desc',
      status: filter.status === 'all' ? undefined : filter.status,
      absentDateFrom: filter.absentDateFrom || undefined,
      absentDateTo: filter.absentDateTo || undefined,
    }),
    [filter, page]
  )

  const absencesQuery = useAbsences(params)
  const records = absencesQuery.data?.data ?? []
  const meta = absencesQuery.data?.meta

  const handleFilterChange = (nextFilter: HistoryFilter) => {
    setFilter(nextFilter)
    setPage(1)
  }

  return (
    <div className='space-y-5'>
      <AbsenceHistoryFilterBar value={filter} onChange={handleFilterChange} />

      {absencesQuery.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertTitle>Gagal memuat riwayat absensi</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(
              absencesQuery.error,
              'Silakan periksa filter dan coba lagi.'
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className='rounded-lg border bg-card'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
          <div>
            <h3 className='font-semibold'>Riwayat Absensi</h3>
            <p className='text-sm text-muted-foreground'>
              {meta ? `${meta.total} data ditemukan` : 'Memuat data absensi'}
            </p>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={absencesQuery.isFetching}
            onClick={() => absencesQuery.refetch()}
          >
            <Search />
            Muat Ulang
          </Button>
        </div>

        {absencesQuery.isLoading ? (
          <div className='space-y-3 p-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className='h-10 rounded-md' />
            ))}
          </div>
        ) : (
          <AbsenceHistoryTable records={records} />
        )}

        <div className='flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3'>
          <p className='text-sm text-muted-foreground'>
            Halaman {meta?.page ?? page} dari {meta?.totalPages ?? 1}
          </p>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!meta?.hasPrevPage || absencesQuery.isFetching}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              <ChevronLeft />
              Sebelumnya
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!meta?.hasNextPage || absencesQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
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

function AbsenceHistoryFilterBar({
  value,
  onChange,
}: {
  value: HistoryFilter
  onChange: (filter: HistoryFilter) => void
}) {
  return (
    <div className='flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4'>
      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Tanggal Mulai</Label>
        <Input
          type='date'
          className='h-9 w-44'
          value={value.absentDateFrom}
          onChange={(event) =>
            onChange({ ...value, absentDateFrom: event.target.value })
          }
        />
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Tanggal Selesai</Label>
        <Input
          type='date'
          className='h-9 w-44'
          value={value.absentDateTo}
          onChange={(event) =>
            onChange({ ...value, absentDateTo: event.target.value })
          }
        />
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Status</Label>
        <Select
          value={value.status}
          onValueChange={(status) =>
            onChange({ ...value, status: status as HistoryFilter['status'] })
          }
        >
          <SelectTrigger className='h-9 w-40'>
            <SelectValue placeholder='Semua status' />
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
  )
}

function AbsenceHistoryTable({ records }: { records: AbsenceRecord[] }) {
  if (records.length === 0) {
    return (
      <div className='px-4 py-12 text-center text-sm text-muted-foreground'>
        Belum ada data absensi untuk filter ini.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Santri</TableHead>
          <TableHead>Kelas / Jadwal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Catatan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{record.absentDate}</TableCell>
            <TableCell>
              <div className='font-medium'>
                {record.student?.name ?? record.studentId}
              </div>
              <div className='text-xs text-muted-foreground'>
                {record.student?.nis ? `NIS ${record.student.nis}` : 'NIS -'}
              </div>
            </TableCell>
            <TableCell>
              <div className='font-medium'>
                {record.schedule?.class?.name ?? 'Kelas -'}
              </div>
              <div className='text-xs text-muted-foreground'>
                {getScheduleLabel(record)}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  record.status === 'ABSENT' ? 'destructive' : 'secondary'
                }
              >
                {getAbsenceStatusLabel(record.status)}
              </Badge>
            </TableCell>
            <TableCell className='max-w-64 truncate'>
              {record.note || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function getScheduleLabel(record: AbsenceRecord) {
  const subject = record.schedule?.subject?.name
  const teacher = record.schedule?.teacher?.name
  const slot = record.schedule?.scheduleSlot

  const slotLabel = slot
    ? `Slot ${slot.slot}, ${slot.startTime}-${slot.endTime}`
    : 'Slot -'

  return [subject, teacher, slotLabel].filter(Boolean).join(' · ')
}
