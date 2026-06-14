'use client'

import { Loader2, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDeactivateSchedule } from '../hooks/use-schedules'
import type { Schedule } from '../services/schedule-service'

type ScheduleDeactivateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: Schedule
}

export function ScheduleDeactivateDialog({
  open,
  onOpenChange,
  schedule,
}: ScheduleDeactivateDialogProps) {
  const deactivate = useDeactivateSchedule()

  const handleDeactivate = async () => {
    try {
      await deactivate.mutateAsync(schedule.id)
      toast.success('Schedule deactivated.')
      onOpenChange(false)
    } catch {
      // handled by interceptor
    }
  }

  const label = schedule.subject?.name
    ? `${schedule.subject.name} — ${schedule.class?.name ?? ''}`
    : 'this schedule'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Schedule</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate{' '}
            <span className='font-semibold text-foreground'>{label}</span>?{' '}
            The schedule will be archived (not deleted) and can be reviewed in history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deactivate.isPending}>Cancel</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDeactivate}
            disabled={deactivate.isPending}
          >
            {deactivate.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <PowerOff className='mr-2 h-4 w-4' />
            )}
            Deactivate
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
