import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { AbsenceStatus } from '../services/absence-service'
import { ABSENCE_STATUS_OPTIONS } from '../utils/absence-utils'

interface AbsenceStatusControlProps {
  value: AbsenceStatus
  onChange: (value: AbsenceStatus) => void
  disabled?: boolean
}

export function AbsenceStatusControl({
  value,
  onChange,
  disabled,
}: AbsenceStatusControlProps) {
  return (
    <div className='grid grid-cols-2 gap-1 rounded-md border bg-muted/30 p-1 sm:grid-cols-4'>
      {ABSENCE_STATUS_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type='button'
          variant='ghost'
          size='sm'
          disabled={disabled}
          data-active={value === option.value}
          className={cn(
            'h-8 min-w-16 px-2 text-xs',
            option.className,
            value === option.value && 'hover:text-white'
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
