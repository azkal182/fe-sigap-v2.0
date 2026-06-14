'use client'

import { useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDormitories } from '@/features/users/hooks/use-users'
import { useTracksByDormitory } from '@/features/classrooms/hooks/use-classrooms'
import type { Dormitory } from '@/features/users/services/permission-service'
import type { Track } from '@/features/classrooms/services/classroom-service'

export type SubjectFilter = {
  dormitoryId: string | undefined
  trackId: string | undefined
  dormitory: Dormitory | undefined
  track: Track | undefined
}

type SubjectFilterBarProps = {
  value: SubjectFilter
  onChange: (filter: SubjectFilter) => void
}

export function SubjectFilterBar({ value, onChange }: SubjectFilterBarProps) {
  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const { data: tracksData, isLoading: isLoadingTrack } = useTracksByDormitory(value.dormitoryId)
  const tracks = tracksData?.data ?? []

  const handleDormitoryChange = (dormitoryId: string) => {
    const dorm = dormitories.find((d) => d.id === dormitoryId)
    onChange({ dormitoryId, trackId: undefined, dormitory: dorm, track: undefined })
  }

  const handleTrackChange = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId)
    onChange({ ...value, trackId: trackId === 'all' ? undefined : trackId, track: trackId === 'all' ? undefined : track })
  }

  // Reset track if dormitory changes and track no longer belongs to it
  useEffect(() => {
    if (value.trackId && tracks.length > 0) {
      const found = tracks.find((t) => t.id === value.trackId)
      if (!found) {
        onChange({ ...value, trackId: undefined, track: undefined })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks])

  return (
    <div className='flex flex-wrap items-end gap-4'>
      {/* Dormitory */}
      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs text-muted-foreground'>Dormitory</Label>
        {isLoadingDorm ? (
          <Skeleton className='h-9 w-48' />
        ) : (
          <Select value={value.dormitoryId ?? ''} onValueChange={handleDormitoryChange}>
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

      {/* Track — nested */}
      {value.dormitoryId && (
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Track</Label>
          {isLoadingTrack ? (
            <Skeleton className='h-9 w-44' />
          ) : (
            <Select
              value={value.trackId ?? 'all'}
              onValueChange={handleTrackChange}
            >
              <SelectTrigger className='h-9 w-44'>
                <SelectValue placeholder='All tracks' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All tracks</SelectItem>
                {tracks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span>{t.name}</span>
                    <span className='ms-1.5 text-xs text-muted-foreground'>
                      Lv.{t.level}
                    </span>
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
