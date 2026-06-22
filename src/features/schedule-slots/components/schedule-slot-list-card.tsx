import { useMemo, useState } from 'react'
import { Clock, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableFacetedFilter } from '@/components/data-table'
import { useDormitories } from '@/features/users/hooks/use-users'
import { useScheduleSlots } from '../hooks/use-schedule-slots'
import type { ScheduleSlot } from '../services/schedule-slot-service'
import { ScheduleSlotActionDialog } from './schedule-slot-action-dialog'
import { ScheduleSlotDeleteDialog } from './schedule-slot-delete-dialog'

const PAGE_SIZE = 20

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Row actions ─────────────────────────────────────────────────────────────

function SlotRowActions({
  slot,
  onEdit,
  onDelete,
}: {
  slot: ScheduleSlot
  onEdit: (slot: ScheduleSlot) => void
  onDelete: (slot: ScheduleSlot) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[140px]'>
        <DropdownMenuItem onClick={() => onEdit(slot)}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(slot)}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function SlotPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}) {
  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <div className='flex items-center justify-between overflow-clip px-2'>
      <p className='text-sm text-muted-foreground'>
        {start}–{end} of {total} rows
      </p>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          className='size-8 p-0'
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <span className='sr-only'>Previous page</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
          >
            <path d='m15 18-6-6 6-6' />
          </svg>
        </Button>
        <span className='flex w-16 items-center justify-center text-sm font-medium'>
          {page} / {totalPages}
        </span>
        <Button
          variant='outline'
          className='size-8 p-0'
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <span className='sr-only'>Next page</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
          >
            <path d='m9 18 6-6-6-6' />
          </svg>
        </Button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ScheduleSlotListCardProps = {
  /** If provided, opens the action dialog with this slot pre-filled */
  defaultDormitoryId?: string
}

export function ScheduleSlotListCard({
  defaultDormitoryId,
}: ScheduleSlotListCardProps = {}) {
  const [selectedDormitoryId, setSelectedDormitoryId] = useState<string>(
    defaultDormitoryId ?? ''
  )
  const [page, setPage] = useState(1)

  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    slot?: ScheduleSlot
  }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    slot?: ScheduleSlot
  }>({ open: false })

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: dormitoriesData } = useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const dormitoryOptions = useMemo(
    () =>
      dormitories.map((d) => ({
        label: `${d.name} (${d.gender} · Lv.${d.level})`,
        value: d.id,
      })),
    [dormitories]
  )

  const dormitorySelected = useMemo(
    () => new Set(selectedDormitoryId ? [selectedDormitoryId] : []),
    [selectedDormitoryId]
  )

  const { data, isLoading } = useScheduleSlots({
    dormitoryId: selectedDormitoryId || undefined,
    sortBy: 'slot',
    sortOrder: 'asc',
    page,
    limit: PAGE_SIZE,
  })

  const slots = data?.data ?? []
  const meta = data?.meta

  const handleDormitorySelect = (value: string) => {
    setSelectedDormitoryId((prev) => (prev === value ? '' : value))
    setPage(1)
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <DataTableFacetedFilter
            title='Dormitory'
            options={dormitoryOptions}
            selectedValues={dormitorySelected}
            onSelect={handleDormitorySelect}
            onClear={() => {
              setSelectedDormitoryId('')
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow className='group/row'>
              <TableHead className='w-16 bg-background ps-4 text-center group-hover/row:bg-muted'>
                Slot #
              </TableHead>
              <TableHead className='bg-background group-hover/row:bg-muted'>
                Start Time
              </TableHead>
              <TableHead className='bg-background group-hover/row:bg-muted'>
                End Time
              </TableHead>
              <TableHead className='bg-background group-hover/row:bg-muted'>
                Duration
              </TableHead>
              <TableHead className='w-12 bg-background group-hover/row:bg-muted' />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : slots.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='h-24 text-center text-muted-foreground'
                >
                  <div className='flex flex-col items-center gap-1'>
                    <Clock className='h-8 w-8 opacity-30' />
                    <p className='text-sm'>No schedule slots found.</p>
                    {!selectedDormitoryId && (
                      <p className='text-xs'>
                        Filter by dormitory to view its slots.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              slots.map((s) => {
                const duration = calcDuration(s.startTime, s.endTime)
                return (
                  <TableRow key={s.id} className='group/row'>
                    <TableCell className='bg-background ps-4 text-center group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center',
                          'rounded-md bg-primary/10 text-xs font-bold text-primary'
                        )}
                      >
                        {s.slot}
                      </span>
                    </TableCell>
                    <TableCell className='bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                      <div className='flex items-center gap-1.5'>
                        <Clock
                          size={12}
                          className='shrink-0 text-muted-foreground'
                        />
                        <span className='font-mono text-sm'>{s.startTime}</span>
                      </div>
                    </TableCell>
                    <TableCell className='bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                      <div className='flex items-center gap-1.5'>
                        <Clock
                          size={12}
                          className='shrink-0 text-muted-foreground'
                        />
                        <span className='font-mono text-sm'>{s.endTime}</span>
                      </div>
                    </TableCell>
                    <TableCell className='bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                      <Badge variant='outline' className='font-mono text-xs'>
                        {duration}
                      </Badge>
                    </TableCell>
                    <TableCell className='bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                      <SlotRowActions
                        slot={s}
                        onEdit={(slot) => setActionDialog({ open: true, slot })}
                        onDelete={(slot) =>
                          setDeleteDialog({ open: true, slot })
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — only shown when there are multiple pages */}
      {meta && meta.totalPages > 1 && (
        <SlotPagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

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
    </div>
  )
}
