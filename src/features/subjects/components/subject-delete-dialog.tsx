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
import { useDeleteSubject } from '../hooks/use-subjects'
import type { Subject } from '../services/subject-service'

type SubjectDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject
}

export function SubjectDeleteDialog({
  open,
  onOpenChange,
  subject,
}: SubjectDeleteDialogProps) {
  const deleteSubject = useDeleteSubject()

  const handleDelete = async () => {
    try {
      await deleteSubject.mutateAsync(subject.id)
      toast.success(`Subject "${subject.name}" deleted.`)
      onOpenChange(false)
    } catch {
      // error toast handled by axios interceptor
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className='font-semibold text-foreground'>{subject.name}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSubject.isPending}>Cancel</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteSubject.isPending}
          >
            {deleteSubject.isPending ? (
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
