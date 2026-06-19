'use client'

import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import type { Classroom } from '@/features/classrooms/services/classroom-service'
import { useDormitories } from '@/features/users/hooks/use-users'
import type { Dormitory } from '@/features/users/services/permission-service'

export type ScheduleFilter = {
  dormitoryId: string | undefined
  classId: string | undefined
  dormitory: Dormitory | undefined
  classroom: Classroom | undefined
}

type ScheduleFilterBarProps = {
  value: ScheduleFilter
  onChange: (filter: ScheduleFilter) => void
}

export function ScheduleFilterBar({ value, onChange }: ScheduleFilterBarProps) {
  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({
    limit: 100,
  })
  const dormitories = dormitoriesData?.data ?? []

  const { data: classesData, isLoading: isLoadingClass } = useClassrooms({
    dormitoryId: value.dormitoryId,
    active: true,
    limit: 100,
    includeDetails: true,
  })
  const classes = classesData?.data ?? []

  const handleDormitoryChange = (dormitoryId: string) => {
    const dorm = dormitories.find((d) => d.id === dormitoryId)
    onChange({
      dormitoryId,
      classId: undefined,
      dormitory: dorm,
      classroom: undefined,
    })
  }

  const handleClassChange = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    onChange({
      ...value,
      classId: classId === 'all' ? undefined : classId,
      classroom: classId === 'all' ? undefined : cls,
    })
  }

  // Reset class if dormitory changes and class no longer belongs to it
  useEffect(() => {
    if (value.classId && classes.length > 0) {
      const found = classes.find((c) => c.id === value.classId)
      if (!found)
        onChange({ ...value, classId: undefined, classroom: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes])

  return (
    <div className='flex flex-wrap items-end gap-4'>
      {/* Dormitory */}
      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Dormitory</Label>
        {isLoadingDorm ? (
          <Skeleton className='h-9 w-48' />
        ) : (
          <Select
            value={value.dormitoryId ?? ''}
            onValueChange={handleDormitoryChange}
          >
            <SelectTrigger className='h-9 w-48'>
              <SelectValue placeholder='Select dormitory…' />
            </SelectTrigger>
            <SelectContent>
              {dormitories.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  <span>{d.name}</span>
                  <span className='ms-1.5 text-xs text-muted-foreground'>
                    ({d.gender} · Lv.{d.level})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Class — nested */}
      {value.dormitoryId && (
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Class</Label>
          {isLoadingClass ? (
            <Skeleton className='h-9 w-52' />
          ) : (
            <Select
              value={value.classId ?? 'all'}
              onValueChange={handleClassChange}
            >
              <SelectTrigger className='h-9 w-52'>
                <SelectValue placeholder='All classes' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span>{c.name}</span>
                    {c.track && (
                      <span className='ms-1.5 text-xs text-muted-foreground'>
                        · {c.track.name}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  )
}
