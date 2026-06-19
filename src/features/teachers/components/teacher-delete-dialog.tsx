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
import { useDeleteTeacher } from '../hooks/use-teachers'
import type { Teacher } from '../services/teacher-service'

type TeacherDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher
}

export function TeacherDeleteDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherDeleteDialogProps) {
  const del = useDeleteTeacher()

  const handleDelete = async () => {
    try {
      await del.mutateAsync(teacher.id)
      toast.success(`Teacher "${teacher.name}" deleted.`)
      onOpenChange(false)
    } catch {
      // handled by interceptor
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete{' '}
            <span className='font-semibold text-foreground'>
              {teacher.name}
            </span>
            ?
            {teacher.userId && (
              <span className='mt-1 block text-destructive'>
                ⚠ This teacher has a login account that will also be removed.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={del.isPending}>Cancel</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={del.isPending}
          >
            {del.isPending ? (
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
