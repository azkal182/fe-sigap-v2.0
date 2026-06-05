'use client'

import { useState } from 'react'
import { Search, Loader2, BookOpen, Users, CheckCircle2, XCircle, GraduationCap, CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useClassrooms } from '../hooks/use-classrooms'
import type { ClassroomFilter } from './classroom-filter-bar'
import type { Classroom } from '../services/classroom-service'

type ClassroomListCardProps = {
  filter: ClassroomFilter
  selectedId: string | undefined
  onSelect: (classroom: Classroom) => void
}

export function ClassroomListCard({ filter, selectedId, onSelect }: ClassroomListCardProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12

  const { data, isLoading, isFetching } = useClassrooms({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    dormitoryId: filter.dormitoryId,
    trackId: filter.trackId === 'all' ? undefined : filter.trackId,
  })

  const classrooms = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <Card>
      <CardHeader className='pb-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <CardTitle className='flex items-center gap-2 text-base'>
              <BookOpen size={16} />
              Classrooms
              {meta && (
                <Badge variant='secondary' className='ms-1'>
                  {meta.total}
                </Badge>
              )}
              {isFetching && !isLoading && (
                <Loader2 size={13} className='animate-spin text-muted-foreground' />
              )}
            </CardTitle>
            <CardDescription className='mt-0.5'>
              {filter.dormitory
                ? `Classrooms in ${filter.dormitory.name}${filter.track ? ` · ${filter.track.name}` : ''}`
                : 'Select a dormitory to filter classrooms'}
            </CardDescription>
          </div>

          {/* Search */}
          <div className='relative'>
            <Search
              size={14}
              className='absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              placeholder='Search classrooms…'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='h-8 w-56 ps-8'
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <ClassroomCardSkeleton key={i} />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <div className='flex flex-col items-center gap-3 py-16 text-center'>
            <BookOpen size={40} className='text-muted-foreground/40' />
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {search ? 'No classrooms match your search.' : 'No classrooms found.'}
              </p>
              {!filter.dormitory && (
                <p className='mt-1 text-xs text-muted-foreground'>
                  Select a dormitory from the filter above to get started.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {classrooms.map((cls) => (
                <ClassroomItem
                  key={cls.id}
                  classroom={cls}
                  isSelected={cls.id === selectedId}
                  onSelect={() => onSelect(cls)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-4 flex items-center justify-center gap-2'>
                <button
                  className='rounded-md border px-3 py-1 text-xs disabled:opacity-40'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className='text-xs text-muted-foreground'>
                  {page} / {totalPages}
                </span>
                <button
                  className='rounded-md border px-3 py-1 text-xs disabled:opacity-40'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Classroom item card ──────────────────────────────────────────────────────

function ClassroomItem({
  classroom,
  isSelected,
  onSelect,
}: {
  classroom: Classroom
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border p-4 transition-all cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
          : 'hover:border-primary/40 hover:bg-muted/40',
        !classroom.active && 'opacity-60'
      )}
    >
      {/* Status badge */}
      <div className='absolute end-3 top-3'>
        {classroom.active ? (
          <CheckCircle2 size={14} className='text-green-500' />
        ) : (
          <XCircle size={14} className='text-red-400' />
        )}
      </div>

      {/* Name */}
      <p className='pe-5 text-sm font-semibold leading-tight'>{classroom.name}</p>

      {/* Teacher */}
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <Users size={12} className='shrink-0' />
        <span className='truncate'>{classroom.teacher || '—'}</span>
      </div>

      {/* Student & schedule counts */}
      {(classroom.activeStudentCount !== undefined || classroom.scheduleCount !== undefined) && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {classroom.activeStudentCount !== undefined && (
            <span className='flex items-center gap-1'>
              <GraduationCap size={11} />
              {classroom.activeStudentCount} siswa
            </span>
          )}
          {classroom.scheduleCount !== undefined && (
            <span className='flex items-center gap-1'>
              <CalendarDays size={11} />
              {classroom.scheduleCount} jadwal
            </span>
          )}
        </div>
      )}

      {/* Track / Dormitory chips */}
      <div className='flex flex-wrap gap-1 pt-1'>
        {classroom.track && (
          <Badge variant='outline' className='h-5 px-1.5 text-[10px]'>
            {classroom.track.name}
          </Badge>
        )}
        {classroom.dormitory && (
          <Badge variant='secondary' className='h-5 px-1.5 text-[10px]'>
            {classroom.dormitory.gender} · Lv.{classroom.dormitory.level}
          </Badge>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ClassroomCardSkeleton() {
  return (
    <div className='animate-pulse rounded-lg border p-4'>
      <div className='mb-2 h-4 w-3/4 rounded bg-muted' />
      <div className='mb-3 h-3 w-1/2 rounded bg-muted' />
      <div className='flex gap-1'>
        <div className='h-4 w-16 rounded bg-muted' />
        <div className='h-4 w-12 rounded bg-muted' />
      </div>
    </div>
  )
}
