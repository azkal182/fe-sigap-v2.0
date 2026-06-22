import { useState } from 'react'
import {
  BookMarked,
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSubjects } from '../hooks/use-subjects'
import type { Subject } from '../services/subject-service'
import { SubjectActionDialog } from './subject-action-dialog'
import { SubjectDeleteDialog } from './subject-delete-dialog'
import type { SubjectFilter } from './subject-filter-bar'

const PAGE_SIZE = 15

// ─── Row Actions ──────────────────────────────────────────────────────────────

function SubjectRowActions({
  subject,
  onEdit,
  onDelete,
}: {
  subject: Subject
  onEdit: (subject: Subject) => void
  onDelete: (subject: Subject) => void
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
        <DropdownMenuItem onClick={() => onEdit(subject)}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(subject)}
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

function SubjectPagination({
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

type SubjectListCardProps = {
  filter: SubjectFilter
}

export function SubjectListCard({ filter }: SubjectListCardProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    subject?: Subject
  }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    subject?: Subject
  }>({ open: false })

  const { data, isLoading } = useSubjects({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    dormitoryId: filter.dormitoryId,
    trackId: filter.trackId || undefined,
  })

  const subjects = data?.data ?? []
  const meta = data?.meta

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Search subjects...'
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='h-8 w-48 lg:w-64'
          />
        </div>
        <Button
          size='sm'
          className='gap-1.5'
          onClick={() => setActionDialog({ open: true })}
        >
          <Plus size={14} />
          Add Subject
        </Button>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow className='group/row'>
              <TableHead className='w-10 bg-background ps-4 text-center group-hover/row:bg-muted'>
                #
              </TableHead>
              <TableHead className='bg-background group-hover/row:bg-muted'>
                Subject Name
              </TableHead>
              <TableHead className='bg-background group-hover/row:bg-muted'>
                Track
              </TableHead>
              <TableHead className='w-12 bg-background group-hover/row:bg-muted' />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  <div className='flex flex-col items-center gap-1 text-muted-foreground'>
                    <BookMarked className='h-8 w-8 opacity-30' />
                    <p className='text-sm'>
                      {search
                        ? 'No subjects match your search.'
                        : 'No subjects found.'}
                    </p>
                    {!filter.dormitory && !search && (
                      <p className='text-xs'>
                        Select a dormitory from the filter above to get started.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject, idx) => (
                <TableRow key={subject.id} className='group/row'>
                  <TableCell className='bg-background ps-4 text-center text-xs text-muted-foreground group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </TableCell>
                  <TableCell className='bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                    <span className='font-medium'>{subject.name}</span>
                  </TableCell>
                  <TableCell className='bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                    {subject.track ? (
                      <div className='flex items-center gap-1.5'>
                        <Layers
                          size={12}
                          className='shrink-0 text-muted-foreground'
                        />
                        <span className='text-sm'>{subject.track.name}</span>
                        <Badge
                          variant='outline'
                          className='h-4 px-1 text-[10px]'
                        >
                          Lv.{subject.track.level}
                        </Badge>
                      </div>
                    ) : (
                      <span
                        className={cn('text-xs text-muted-foreground italic')}
                      >
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'>
                    <SubjectRowActions
                      subject={subject}
                      onEdit={(s) =>
                        setActionDialog({ open: true, subject: s })
                      }
                      onDelete={(s) =>
                        setDeleteDialog({ open: true, subject: s })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — only shown when there are multiple pages */}
      {meta && meta.totalPages > 1 && (
        <SubjectPagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      {/* Dialogs */}
      <SubjectActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((s) => ({ ...s, open }))}
        subject={actionDialog.subject}
        defaultDormitoryId={filter.dormitoryId}
        defaultTrackId={filter.trackId}
      />

      {deleteDialog.subject && (
        <SubjectDeleteDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog((s) => ({ ...s, open }))}
          subject={deleteDialog.subject}
        />
      )}
    </div>
  )
}
