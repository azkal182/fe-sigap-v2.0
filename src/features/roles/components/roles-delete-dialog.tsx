'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteRole } from '../hooks/use-roles'
import { type Role } from '../services/role-service'

type RolesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Role
}

export function RolesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: RolesDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteRole = useDeleteRole()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return

    try {
      await deleteRole.mutateAsync(currentRow.id)
      toast.success(`Role "${currentRow.name}" deleted`)
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to delete role'))
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
      form='role-delete-form'
      disabled={value.trim() !== currentRow.name || deleteRole.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Role
        </span>
      }
      desc={
        <form
          id='role-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete role{' '}
            <span className='font-bold'>{currentRow.name}</span>?<br />
            This action cannot be undone. Users assigned to this role will lose
            its permissions.
          </p>

          <Label className='my-2'>
            Type role name to confirm:
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
