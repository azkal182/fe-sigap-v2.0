'use client'

import { useState } from 'react'
import { Clock, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { useDormitories } from '@/features/users/hooks/use-users'
import type { Dormitory } from '@/features/users/services/permission-service'
import { useScheduleSlots } from '../hooks/use-schedule-slots'
import type { ScheduleSlot } from '../services/schedule-slot-service'
import { ScheduleSlotActionDialog } from './schedule-slot-action-dialog'
import { ScheduleSlotDeleteDialog } from './schedule-slot-delete-dialog'

export function ScheduleSlotListCard() {
  // ── Filter state ─────────────────────────────────────────────────────────────
  const [selectedDormitoryId, setSelectedDormitoryId] = useState<string>('')
  const [selectedDormitory, setSelectedDormitory] = useState<
    Dormitory | undefined
  >()
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  // ── Dialog state ─────────────────────────────────────────────────────────────
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    slot?: ScheduleSlot
  }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    slot?: ScheduleSlot
  }>({ open: false })

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({
    limit: 100,
  })
  const dormitories = dormitoriesData?.data ?? []

  const hasFilter = !!selectedDormitoryId

  const { data, isLoading, isFetching } = useScheduleSlots(
    hasFilter
      ? {
          dormitoryId: selectedDormitoryId,
          sortBy: 'slot',
          sortOrder: 'asc',
          page,
          limit: PAGE_SIZE,
        }
      : {
          sortBy: 'slot',
          sortOrder: 'asc',
          page,
          limit: PAGE_SIZE,
        }
  )

  const slots = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const handleDormitoryChange = (val: string) => {
    const dorm = dormitories.find((d) => d.id === val)
    setSelectedDormitoryId(val === 'all' ? '' : val)
    setSelectedDormitory(val === 'all' ? undefined : dorm)
    setPage(1)
  }

  return (
    <>
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            {/* Title */}
            <div>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Clock size={16} />
                Schedule Slots
                {meta && (
                  <Badge variant='secondary' className='ms-1'>
                    {meta.total}
                  </Badge>
                )}
                {isFetching && !isLoading && (
                  <Loader2
                    size={13}
                    className='animate-spin text-muted-foreground'
                  />
                )}
              </CardTitle>
              <CardDescription className='mt-0.5'>
                {selectedDormitory
                  ? `Time slots configured for ${selectedDormitory.name}`
                  : 'All schedule slots across dormitories'}
              </CardDescription>
            </div>

            {/* Controls */}
            <div className='flex flex-wrap items-end gap-3'>
              {/* Dormitory filter */}
              <div className='flex flex-col gap-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  Dormitory
                </Label>
                {isLoadingDorm ? (
                  <Skeleton className='h-8 w-48' />
                ) : (
                  <Select
                    value={selectedDormitoryId || 'all'}
                    onValueChange={handleDormitoryChange}
                  >
                    <SelectTrigger className='h-8 w-48'>
                      <SelectValue placeholder='All dormitories' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All dormitories</SelectItem>
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

              {/* Add button */}
              <Button
                size='sm'
                className='h-8 gap-1.5'
                onClick={() => setActionDialog({ open: true })}
              >
                <Plus size={14} />
                Add Slot
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {isLoading ? (
            <SlotTableSkeleton />
          ) : slots.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-16 text-center'>
              <Clock size={40} className='text-muted-foreground/40' />
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  No schedule slots found.
                </p>
                {!selectedDormitory && (
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Select a dormitory to filter, or add a new slot.
                  </p>
                )}
              </div>
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                onClick={() => setActionDialog({ open: true })}
              >
                <Plus size={13} />
                Add Slot
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='w-16 ps-6 text-center'>
                      Slot #
                    </TableHead>
                    <TableHead className='w-36'>Start Time</TableHead>
                    <TableHead className='w-36'>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className='w-24 text-center'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((s) => {
                    const duration = calcDuration(s.startTime, s.endTime)
                    return (
                      <TableRow key={s.id}>
                        <TableCell className='ps-6 text-center'>
                          <span className='inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary'>
                            {s.slot}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1.5'>
                            <Clock
                              size={12}
                              className='shrink-0 text-muted-foreground'
                            />
                            <span className='font-mono text-sm'>
                              {s.startTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1.5'>
                            <Clock
                              size={12}
                              className='shrink-0 text-muted-foreground'
                            />
                            <span className='font-mono text-sm'>
                              {s.endTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className='font-mono text-xs'
                          >
                            {duration}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center justify-center gap-1'>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-7 w-7'
                              onClick={() =>
                                setActionDialog({ open: true, slot: s })
                              }
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-7 w-7 text-destructive hover:text-destructive'
                              onClick={() =>
                                setDeleteDialog({ open: true, slot: s })
                              }
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between border-t px-6 py-3'>
                  <p className='text-xs text-muted-foreground'>
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, meta?.total ?? 0)} of{' '}
                    {meta?.total}
                  </p>
                  <div className='flex items-center gap-1.5'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 px-3 text-xs'
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className='text-xs text-muted-foreground'>
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 px-3 text-xs'
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ScheduleSlotActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((s) => ({ ...s, open }))}
        slot={actionDialog.slot}
        defaultDormitoryId={selectedDormitoryId || undefined}
      />

      {deleteDialog.slot && (
        <ScheduleSlotDeleteDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog((s) => ({ ...s, open }))}
          slot={deleteDialog.slot}
        />
      )}
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMinutes = eh * 60 + em - (sh * 60 + sm)
  if (totalMinutes <= 0) return '—'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SlotTableSkeleton() {
  return (
    <div className='animate-pulse'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-4 border-b px-6 py-3 last:border-0'
        >
          <div className='h-6 w-6 rounded-md bg-muted' />
          <div className='h-4 w-16 rounded bg-muted' />
          <div className='h-4 w-16 rounded bg-muted' />
          <div className='h-5 w-12 rounded bg-muted' />
          <div className='ms-auto h-7 w-16 rounded bg-muted' />
        </div>
      ))}
    </div>
  )
}
