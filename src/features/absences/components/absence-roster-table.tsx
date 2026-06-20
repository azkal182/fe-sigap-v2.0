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
import type { AbsenceStatus } from '../services/absence-service'
import {
  getAbsenceStatusLabel,
  type AbsenceDraftItem,
} from '../utils/absence-utils'
import { AbsenceStatusControl } from './absence-status-control'

interface AbsenceRosterTableProps {
  items: AbsenceDraftItem[]
  isSubmitting?: boolean
  onChangeStatus: (studentId: string, status: AbsenceStatus) => void
  onChangeNote: (studentId: string, note: string) => void
  onMarkAllPresent: () => void
  onSubmit: () => void
}

export function AbsenceRosterTable({
  items,
  isSubmitting,
  onChangeStatus,
  onChangeNote,
  onMarkAllPresent,
  onSubmit,
}: AbsenceRosterTableProps) {
  const total = items.length
  const presentCount = items.filter((item) => item.status === 'PRESENT').length
  const nonPresentCount = total - presentCount

  return (
    <div className='rounded-lg border bg-card'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
        <div>
          <h3 className='font-semibold'>Daftar Santri</h3>
          <p className='text-sm text-muted-foreground'>
            {presentCount} hadir, {nonPresentCount} tidak hadir dari {total}{' '}
            santri.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isSubmitting || total === 0}
            onClick={onMarkAllPresent}
          >
            Tandai Semua Hadir
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={isSubmitting || total === 0}
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
            <TableHead>Santri</TableHead>
            <TableHead className='min-w-72'>Status</TableHead>
            <TableHead className='min-w-56'>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.studentId}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <div className='space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-medium'>{item.studentName}</span>
                    {item.source === 'permit' && (
                      <Badge variant='secondary'>
                        {item.permit?.type === 'SICK'
                          ? 'Sakit aktif'
                          : 'Izin aktif'}
                      </Badge>
                    )}
                    {item.source === 'absence' && (
                      <Badge variant='outline'>Tersimpan</Badge>
                    )}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    NIS {item.studentNis}
                    {item.permit?.reason && (
                      <span className='ms-1.5'>· {item.permit.reason}</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className='space-y-1.5'>
                  <AbsenceStatusControl
                    value={item.status}
                    disabled={isSubmitting}
                    onChange={(status) =>
                      onChangeStatus(item.studentId, status)
                    }
                  />
                  <div className='text-xs text-muted-foreground'>
                    Status saat ini: {getAbsenceStatusLabel(item.status)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Input
                  value={item.note}
                  disabled={isSubmitting}
                  placeholder='Catatan opsional'
                  onChange={(event) =>
                    onChangeNote(item.studentId, event.target.value)
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
