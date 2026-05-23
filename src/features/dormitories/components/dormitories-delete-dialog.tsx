'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Dormitory } from '../services/dormitory-service'
import { useDeleteDormitory } from '../hooks/use-dormitories'

type DormitoriesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Dormitory
}

export function DormitoriesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: DormitoriesDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteDormitory = useDeleteDormitory()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return

    try {
      await deleteDormitory.mutateAsync(currentRow.id)
      toast.success(`Dormitory "${currentRow.name}" deleted`)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to delete dormitory'
      )
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
      form='dormitory-delete-form'
      disabled={value.trim() !== currentRow.name || deleteDormitory.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Dormitory
        </span>
      }
      desc={
        <form
          id='dormitory-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?<br />
            This action cannot be undone. All students assigned to this
            dormitory may be affected.
          </p>

          <Label className='flex flex-col gap-1.5'>
            Type dormitory name to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${currentRow.name}" to confirm`}
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
