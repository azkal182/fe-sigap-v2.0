'use client'

import { Loader2, Trash2 } from 'lucide-react'
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
import { useDeleteScheduleSlot } from '../hooks/use-schedule-slots'
import type { ScheduleSlot } from '../services/schedule-slot-service'

type ScheduleSlotDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: ScheduleSlot
}

export function ScheduleSlotDeleteDialog({
  open,
  onOpenChange,
  slot,
}: ScheduleSlotDeleteDialogProps) {
  const deleteSlot = useDeleteScheduleSlot()

  const handleDelete = async () => {
    try {
      await deleteSlot.mutateAsync(slot.id)
      toast.success(
        `Slot ${slot.slot} (${slot.startTime}–${slot.endTime}) deleted.`
      )
      onOpenChange(false)
    } catch {
      // handled by interceptor
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Schedule Slot</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className='font-semibold text-foreground'>
              Slot {slot.slot} ({slot.startTime}–{slot.endTime})
            </span>
            ? Schedules that use this slot may be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSlot.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteSlot.isPending}
          >
            {deleteSlot.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Trash2 className='mr-2 h-4 w-4' />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
