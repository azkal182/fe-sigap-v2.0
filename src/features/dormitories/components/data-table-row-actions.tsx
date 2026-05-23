import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { PenLine, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Dormitory } from '../services/dormitory-service'
import { useDormitoriesContext } from './dormitories-provider'
import { useToggleDormitoryStatus } from '../hooks/use-dormitories'

type DataTableRowActionsProps = {
  row: Row<Dormitory>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useDormitoriesContext()
  const toggleStatus = useToggleDormitoryStatus()
  const dormitory = row.original

  const handleAction = (dialog: 'edit' | 'delete') => {
    setCurrentRow(dormitory)
    setOpen(dialog)
  }

  const handleToggleStatus = async () => {
    const newStatus = !dormitory.isActive
    try {
      await toggleStatus.mutateAsync({
        id: dormitory.id,
        isActive: newStatus,
      })
      toast.success(
        `"${dormitory.name}" ${newStatus ? 'activated' : 'deactivated'}`
      )
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to update dormitory status'
      )
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleAction('edit')}>
          Edit
          <DropdownMenuShortcut>
            <PenLine size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleToggleStatus}
          disabled={toggleStatus.isPending}
        >
          {dormitory.isActive ? 'Deactivate' : 'Activate'}
          <DropdownMenuShortcut>
            {dormitory.isActive ? (
              <ToggleLeft size={16} />
            ) : (
              <ToggleRight size={16} />
            )}
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className='text-red-500!'
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
