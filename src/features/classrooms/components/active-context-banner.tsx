import { Building2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ClassroomFilter } from './classroom-filter-bar'

type ActiveContextBannerProps = {
  filter: ClassroomFilter
}

export function ActiveContextBanner({ filter }: ActiveContextBannerProps) {
  const hasContext = !!filter.dormitory

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-4',
        hasContext
          ? 'border-primary/20 bg-primary/5'
          : 'border-dashed bg-muted/40'
      )}
    >
      <p className='text-xs font-medium tracking-widest text-muted-foreground uppercase'>
        Active Context
      </p>

      {!hasContext ? (
        <p className='text-sm text-muted-foreground'>
          Select a dormitory to set the active context.
        </p>
      ) : (
        <div className='flex flex-col gap-2'>
          {/* Dormitory */}
          <div className='flex items-center gap-2'>
            <Building2 size={15} className='shrink-0 text-primary' />
            <div>
              <p className='text-sm leading-tight font-semibold'>
                {filter.dormitory!.name}
              </p>
              <div className='mt-0.5 flex items-center gap-1.5'>
                <Badge variant='secondary' className='h-4 px-1.5 text-[10px]'>
                  {filter.dormitory!.gender}
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  Level {filter.dormitory!.level}
                </span>
              </div>
            </div>
          </div>

          {/* Track — only shown when selected */}
          {filter.track ? (
            <div className='flex items-center gap-2 ps-0.5'>
              <Layers size={15} className='shrink-0 text-primary/70' />
              <div>
                <p className='text-sm leading-tight font-medium'>
                  {filter.track.name}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Track · Level {filter.track.level}
                  {filter.track.targetDays
                    ? ` · ${filter.track.targetDays} days target`
                    : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Layers size={15} className='shrink-0' />
              <p className='text-xs italic'>
                No specific track selected (showing all)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
