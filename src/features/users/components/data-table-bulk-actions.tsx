import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../services/user-service'
import { useBulkUpdateUsers } from '../hooks/use-users'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const bulkUpdate = useBulkUpdateUsers()

  const selectedUsers = selectedRows.map((row) => row.original as User)
  const selectedIds = selectedUsers.map((u) => u.id)
  const count = selectedIds.length

  const handleBulkStatusChange = async (isActive: boolean) => {
    const action = isActive ? 'Activating' : 'Deactivating'
    const actionDone = isActive ? 'Activated' : 'Deactivated'

    toast.promise(
      bulkUpdate.mutateAsync({ ids: selectedIds, data: { isActive } }).then(() => {
        table.resetRowSelection()
      }),
      {
        loading: `${action} ${count} user${count > 1 ? 's' : ''}...`,
        success: `${actionDone} ${count} user${count > 1 ? 's' : ''}`,
        error: (err) =>
          err?.response?.data?.message ||
          `Failed to ${isActive ? 'activate' : 'deactivate'} users`,
      }
    )
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange(true)}
              disabled={bulkUpdate.isPending}
              className='size-8'
              aria-label='Activate selected users'
            >
              <UserCheck />
              <span className='sr-only'>Activate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange(false)}
              disabled={bulkUpdate.isPending}
              className='size-8'
              aria-label='Deactivate selected users'
            >
              <UserX />
              <span className='sr-only'>Deactivate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              disabled={bulkUpdate.isPending}
              className='size-8'
              aria-label='Delete selected users'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
