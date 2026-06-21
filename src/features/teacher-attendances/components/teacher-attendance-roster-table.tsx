'use client'
import { Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TeacherAttendanceStatus } from '../services/teacher-attendance-service'
import {
  TEACHER_ATTENDANCE_STATUS_OPTIONS,
  getTeacherAttendanceStatusLabel,
  type TeacherAttendanceDraftItem,
} from '../utils/teacher-attendance-utils'

interface TeacherAttendanceRosterTableProps {
  items: TeacherAttendanceDraftItem[]
  isSubmitting: boolean
  onChangeStatus: (
    teacherId: string,
    scheduleId: string,
    status: TeacherAttendanceStatus
  ) => void
  onChangeNote: (teacherId: string, scheduleId: string, note: string) => void
  onMarkAllPresent: () => void
  onSubmit: () => void
}

export function TeacherAttendanceRosterTable({
  items,
  isSubmitting,
  onChangeStatus,
  onChangeNote,
  onMarkAllPresent,
  onSubmit,
}: TeacherAttendanceRosterTableProps) {
  const total = items.length
  const presentCount = items.filter((i) => i.status === 'PRESENT').length
  const nonPresentCount = total - presentCount

  if (total === 0) {
    return (
      <div className='rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground'>
        Tidak ada pengajar terjadwal di slot ini.
      </div>
    )
  }

  return (
    <div className='rounded-lg border bg-card'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
        <div>
          <h3 className='font-semibold'>Daftar Pengajar</h3>
          <p className='text-sm text-muted-foreground'>
            {presentCount} hadir, {nonPresentCount} tidak hadir dari {total}{' '}
            pengajar.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isSubmitting}
            onClick={onMarkAllPresent}
          >
            Tandai Semua Hadir
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            <Save />
            Simpan Absensi
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[52px]'>No</TableHead>
            <TableHead>Pengajar</TableHead>
            <TableHead>Kelas / Mapel</TableHead>
            <TableHead className='min-w-72'>Status</TableHead>
            <TableHead className='min-w-56'>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${item.teacherId}-${item.scheduleId}`}>
              <TableCell>{index + 1}</TableCell>

              {/* Pengajar */}
              <TableCell>
                <div className='space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-medium'>{item.teacherName}</span>
                    {item.source === 'attendance' && (
                      <Badge variant='outline'>Tersimpan</Badge>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Kelas & Mapel */}
              <TableCell>
                <div className='font-medium'>{item.className}</div>
                <div className='text-xs text-muted-foreground'>
                  {item.subjectName}
                </div>
              </TableCell>

              {/* Status toggle */}
              <TableCell>
                <div className='space-y-1.5'>
                  <div className='flex flex-wrap gap-1'>
                    {TEACHER_ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        disabled={isSubmitting}
                        data-active={item.status === opt.value}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50 ${opt.className}`}
                        onClick={() =>
                          onChangeStatus(
                            item.teacherId,
                            item.scheduleId,
                            opt.value
                          )
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Status saat ini:{' '}
                    {getTeacherAttendanceStatusLabel(item.status)}
                  </div>
                </div>
              </TableCell>

              {/* Catatan */}
              <TableCell>
                <Input
                  value={item.note}
                  disabled={isSubmitting}
                  placeholder='Catatan opsional'
                  onChange={(e) =>
                    onChangeNote(
                      item.teacherId,
                      item.scheduleId,
                      e.target.value
                    )
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
