'use client'

import { useState } from 'react'
import {
  Search,
  Loader2,
  UserCog,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
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
import { useTeachers } from '../hooks/use-teachers'
import type { Teacher } from '../services/teacher-service'
import { TeacherActionDialog } from './teacher-action-dialog'
import { TeacherDeleteDialog } from './teacher-delete-dialog'
import { TeacherLoginDialog } from './teacher-login-dialog'

const PAGE_SIZE = 15

export function TeacherListCard() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [dormitoryId, setDormitoryId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    teacher?: Teacher
  }>({
    open: false,
  })
  const [loginDialog, setLoginDialog] = useState<{
    open: boolean
    teacher?: Teacher
  }>({
    open: false,
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    teacher?: Teacher
  }>({
    open: false,
  })

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({
    limit: 100,
  })
  const dormitories = dormitoriesData?.data ?? []

  const { data, isLoading, isFetching } = useTeachers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    dormitoryId: dormitoryId || undefined,
    isActive:
      statusFilter === 'active'
        ? true
        : statusFilter === 'inactive'
          ? false
          : undefined,
  })

  const teachers = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }
  const handleDormitory = (v: string) => {
    setDormitoryId(v === 'all' ? '' : v)
    setPage(1)
  }
  const handleStatus = (v: string) => {
    setStatusFilter(v)
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
                <UserCog size={16} />
                Teachers
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
                Manage teachers and their dormitory assignments
              </CardDescription>
            </div>

            {/* Controls */}
            <div className='flex flex-wrap items-end gap-3'>
              {/* Search */}
              <div className='relative'>
                <Search
                  size={14}
                  className='absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  placeholder='Search teachers…'
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className='h-8 w-48 ps-8'
                />
              </div>

              {/* Dormitory filter */}
              <div className='flex flex-col gap-1'>
                <Label className='text-xs text-muted-foreground'>
                  Dormitory
                </Label>
                {isLoadingDorm ? (
                  <Skeleton className='h-8 w-44' />
                ) : (
                  <Select
                    value={dormitoryId || 'all'}
                    onValueChange={handleDormitory}
                  >
                    <SelectTrigger className='h-8 w-44'>
                      <SelectValue placeholder='All dormitories' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All dormitories</SelectItem>
                      {dormitories.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                          <span className='ms-1 text-xs text-muted-foreground'>
                            ({d.gender})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Status filter */}
              <div className='flex flex-col gap-1'>
                <Label className='text-xs text-muted-foreground'>Status</Label>
                <Select value={statusFilter} onValueChange={handleStatus}>
                  <SelectTrigger className='h-8 w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add */}
              <Button
                size='sm'
                className='h-8 gap-1.5 self-end'
                onClick={() => setActionDialog({ open: true })}
              >
                <Plus size={14} />
                Add Teacher
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {isLoading ? (
            <TeacherTableSkeleton />
          ) : teachers.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-16 text-center'>
              <UserCog size={40} className='text-muted-foreground/40' />
              <p className='text-sm text-muted-foreground'>
                {search
                  ? 'No teachers match your search.'
                  : 'No teachers found.'}
              </p>
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                onClick={() => setActionDialog({ open: true })}
              >
                <Plus size={13} />
                Add Teacher
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='w-10 ps-6 text-center'>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Dormitories</TableHead>
                    <TableHead className='w-24 text-center'>Status</TableHead>
                    <TableHead className='w-28 text-center'>Login</TableHead>
                    <TableHead className='w-28 text-center'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher, idx) => (
                    <TableRow key={teacher.id}>
                      {/* # */}
                      <TableCell className='ps-6 text-center text-xs text-muted-foreground'>
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </TableCell>

                      {/* Name */}
                      <TableCell className='font-medium'>
                        {teacher.name}
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        {teacher.phone ? (
                          <div className='flex items-center gap-1.5 text-sm'>
                            <Phone
                              size={11}
                              className='shrink-0 text-muted-foreground'
                            />
                            {teacher.phone}
                          </div>
                        ) : (
                          <span className='text-xs text-muted-foreground italic'>
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Dormitories */}
                      <TableCell>
                        <DormitoryBadges
                          dormitories={teacher.dormitories ?? []}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell className='text-center'>
                        <Badge
                          variant={teacher.isActive ? 'default' : 'secondary'}
                          className='h-5 px-1.5 text-[10px]'
                        >
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>

                      {/* Login */}
                      <TableCell className='text-center'>
                        {teacher.userId ? (
                          <div className='inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
                            <CheckCircle2 size={13} />
                            Has Login
                          </div>
                        ) : (
                          <div className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                            <XCircle size={13} />
                            No Login
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className='flex items-center justify-center gap-1'>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7'
                            title='Edit teacher'
                            onClick={() =>
                              setActionDialog({ open: true, teacher })
                            }
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7 text-primary hover:text-primary'
                            title='Manage login'
                            onClick={() =>
                              setLoginDialog({ open: true, teacher })
                            }
                          >
                            <KeyRound size={13} />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7 text-destructive hover:text-destructive'
                            title='Delete teacher'
                            onClick={() =>
                              setDeleteDialog({ open: true, teacher })
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
      <TeacherActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((s) => ({ ...s, open }))}
        teacher={actionDialog.teacher}
      />

      {loginDialog.teacher && (
        <TeacherLoginDialog
          open={loginDialog.open}
          onOpenChange={(open) => setLoginDialog((s) => ({ ...s, open }))}
          teacher={loginDialog.teacher}
        />
      )}

      {deleteDialog.teacher && (
        <TeacherDeleteDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog((s) => ({ ...s, open }))}
          teacher={deleteDialog.teacher}
        />
      )}
    </>
  )
}

// ─── Dormitory Badges ─────────────────────────────────────────────────────────

function DormitoryBadges({
  dormitories,
}: {
  dormitories: { id: string; name: string }[]
}) {
  const MAX_VISIBLE = 2
  const visible = dormitories.slice(0, MAX_VISIBLE)
  const extra = dormitories.length - MAX_VISIBLE

  if (dormitories.length === 0) {
    return <span className='text-xs text-muted-foreground italic'>—</span>
  }

  return (
    <div className='flex flex-wrap items-center gap-1'>
      {visible.map((d) => (
        <div
          key={d.id}
          className='flex items-center gap-1 rounded-md border px-1.5 py-0.5'
        >
          <Building2 size={10} className='shrink-0 text-muted-foreground' />
          <span className='text-[11px]'>{d.name}</span>
        </div>
      ))}
      {extra > 0 && (
        <Badge variant='outline' className='h-5 px-1.5 text-[10px]'>
          +{extra} more
        </Badge>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TeacherTableSkeleton() {
  return (
    <div className='animate-pulse'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-4 border-b px-6 py-3 last:border-0'
          )}
        >
          <div className='h-4 w-6 rounded bg-muted' />
          <div className='h-4 w-36 rounded bg-muted' />
          <div className='h-4 w-24 rounded bg-muted' />
          <div className='flex gap-1'>
            <div className='h-5 w-20 rounded bg-muted' />
          </div>
          <div className='ms-auto h-5 w-14 rounded bg-muted' />
          <div className='h-5 w-18 rounded bg-muted' />
          <div className='h-7 w-20 rounded bg-muted' />
        </div>
      ))}
    </div>
  )
}
