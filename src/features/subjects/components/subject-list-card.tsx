'use client'

import { useState } from 'react'
import {
  Search,
  Loader2,
  BookMarked,
  Plus,
  Pencil,
  Trash2,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

type SubjectListCardProps = {
  filter: SubjectFilter
}

export function SubjectListCard({ filter }: SubjectListCardProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  // Dialog state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    subject?: Subject
  }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    subject?: Subject
  }>({ open: false })

  const { data, isLoading, isFetching } = useSubjects({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    dormitoryId: filter.dormitoryId,
    trackId: filter.trackId || undefined,
  })

  const subjects = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <>
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle className='flex items-center gap-2 text-base'>
                <BookMarked size={16} />
                Subjects
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
                {filter.dormitory
                  ? `Subjects in ${filter.dormitory.name}${filter.track ? ` · ${filter.track.name}` : ''}`
                  : 'Select a dormitory to filter subjects'}
              </CardDescription>
            </div>

            <div className='flex items-center gap-2'>
              {/* Search */}
              <div className='relative'>
                <Search
                  size={14}
                  className='absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  placeholder='Search subjects…'
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className='h-8 w-52 ps-8'
                />
              </div>

              {/* Add button */}
              <Button
                size='sm'
                className='h-8 gap-1.5'
                onClick={() => setActionDialog({ open: true })}
              >
                <Plus size={14} />
                Add Subject
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {isLoading ? (
            <SubjectTableSkeleton />
          ) : subjects.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-16 text-center'>
              <BookMarked size={40} className='text-muted-foreground/40' />
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  {search
                    ? 'No subjects match your search.'
                    : 'No subjects found.'}
                </p>
                {!filter.dormitory && (
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Select a dormitory from the filter above to get started.
                  </p>
                )}
              </div>
              <Button
                variant='outline'
                size='sm'
                className='mt-1 gap-1.5'
                onClick={() => setActionDialog({ open: true })}
              >
                <Plus size={13} />
                Add Subject
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='w-10 ps-6 text-center'>#</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead className='w-24 text-center'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject, idx) => (
                    <TableRow key={subject.id}>
                      <TableCell className='ps-6 text-center text-xs text-muted-foreground'>
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className='font-medium'>{subject.name}</span>
                      </TableCell>
                      <TableCell>
                        {subject.track ? (
                          <div className='flex items-center gap-1.5'>
                            <Layers
                              size={12}
                              className='shrink-0 text-muted-foreground'
                            />
                            <span className='text-sm'>
                              {subject.track.name}
                            </span>
                            <Badge
                              variant='outline'
                              className='h-4 px-1 text-[10px]'
                            >
                              Lv.{subject.track.level}
                            </Badge>
                          </div>
                        ) : (
                          <span className='text-xs text-muted-foreground italic'>
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center justify-center gap-1'>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7'
                            onClick={() =>
                              setActionDialog({ open: true, subject })
                            }
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7 text-destructive hover:text-destructive'
                            onClick={() =>
                              setDeleteDialog({ open: true, subject })
                            }
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
    </>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SubjectTableSkeleton() {
  return (
    <div className='space-y-0'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-4 border-b px-6 py-3 last:border-0',
            'animate-pulse'
          )}
        >
          <div className='h-4 w-6 rounded bg-muted' />
          <div className='h-4 flex-1 rounded bg-muted' />
          <div className='h-4 w-32 rounded bg-muted' />
          <div className='h-4 w-16 rounded bg-muted' />
        </div>
      ))}
    </div>
  )
}
