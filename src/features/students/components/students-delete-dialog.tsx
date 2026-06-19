'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteStudent } from '../hooks/use-students'
import { type Student } from '../services/student-service'

type StudentsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Student
}

export function StudentsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: StudentsDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteStudent = useDeleteStudent()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.nis) return

    try {
      await deleteStudent.mutateAsync(currentRow.id)
      toast.success(`Student "${currentRow.name}" deleted`)
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to delete student'))
    } finally {
      setValue('')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!state) setValue('')
        onOpenChange(state)
      }}
      form='student-delete-form'
      disabled={value.trim() !== currentRow.nis || deleteStudent.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Student
        </span>
      }
      desc={
        <form
          id='student-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?<br />
            This action cannot be undone.
          </p>
          <Label className='flex flex-col gap-1.5'>
            Type student NIS to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${currentRow.nis}" to confirm`}
              autoFocus
            />
          </Label>
          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Delete'
      destructive
    />
  )
}
