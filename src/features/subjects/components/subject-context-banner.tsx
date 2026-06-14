import { Building2, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SubjectFilter } from './subject-filter-bar'

type SubjectContextBannerProps = {
  filter: SubjectFilter
}

export function SubjectContextBanner({ filter }: SubjectContextBannerProps) {
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
      <p className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>
        Active Context
      </p>

      {!hasContext ? (
        <p className='text-sm text-muted-foreground'>
          Select a dormitory to set the active context.
        </p>
      ) : (
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <Building2 size={15} className='shrink-0 text-primary' />
            <div>
              <p className='text-sm font-semibold leading-tight'>
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

          {filter.track ? (
            <div className='flex items-center gap-2 ps-0.5'>
              <Layers size={15} className='shrink-0 text-primary/70' />
              <div>
                <p className='text-sm font-medium leading-tight'>{filter.track.name}</p>
                <p className='text-xs text-muted-foreground'>
                  Track · Level {filter.track.level}
                </p>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Layers size={15} className='shrink-0' />
              <p className='text-xs italic'>All tracks</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
