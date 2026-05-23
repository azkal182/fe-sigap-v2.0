import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { KeyRound, Trash2, PenLine } from 'lucide-react'
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
import { type Role } from '../services/role-service'
import { useRolesContext } from './roles-provider'

type DataTableRowActionsProps = {
  row: Row<Role>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useRolesContext()
  const role = row.original
  const isSystem = role.isSystem

  const handleAction = (dialog: 'edit' | 'delete' | 'permissions') => {
    setCurrentRow(role)
    setOpen(dialog)
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
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleAction('edit')}
          disabled={isSystem}
        >
          Edit
          <DropdownMenuShortcut>
            <PenLine size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction('permissions')}>
          Manage Permissions
          <DropdownMenuShortcut>
            <KeyRound size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          disabled={isSystem}
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
