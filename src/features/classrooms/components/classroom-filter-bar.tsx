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
import { useTracksByDormitory } from '../hooks/use-classrooms'
import type { Dormitory } from '@/features/users/services/permission-service'
import type { Track } from '../services/classroom-service'

export type ClassroomFilter = {
  dormitoryId: string | undefined
  trackId: string | undefined
  dormitory: Dormitory | undefined
  track: Track | undefined
}

type ClassroomFilterBarProps = {
  value: ClassroomFilter
  onChange: (filter: ClassroomFilter) => void
}

export function ClassroomFilterBar({ value, onChange }: ClassroomFilterBarProps) {
  const { data: dormitoriesData, isLoading: isLoadingDorm } = useDormitories({ limit: 100 })
  const dormitories = dormitoriesData?.data ?? []

  const { data: tracksData, isLoading: isLoadingTrack } = useTracksByDormitory(value.dormitoryId)
  const tracks = tracksData?.data ?? []

  // When dormitory changes, reset track selection
  const handleDormitoryChange = (dormitoryId: string) => {
    const dorm = dormitories.find((d) => d.id === dormitoryId)
    onChange({ dormitoryId, trackId: undefined, dormitory: dorm, track: undefined })
  }

  // When track changes
  const handleTrackChange = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId)
    onChange({ ...value, trackId, track })
  }

  // When dormitory tracks load, if we have an active trackId that no longer matches, reset it
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
      {/* Dormitory Select */}
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

      {/* Track Select — nested, appears when dormitory is chosen */}
      {value.dormitoryId && (
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Track</Label>
          {isLoadingTrack ? (
            <Skeleton className='h-9 w-44' />
          ) : (
            <Select
              value={value.trackId ?? ''}
              onValueChange={handleTrackChange}
            >
              <SelectTrigger className='h-9 w-44'>
                <SelectValue placeholder='All tracks' />
              </SelectTrigger>
              <SelectContent>
                {/* "All tracks" option */}
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
