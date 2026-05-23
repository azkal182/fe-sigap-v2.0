import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Role } from '../services/role-service'
import { DataTableRowActions } from './data-table-row-actions'

export const rolesColumns: ColumnDef<Role>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3'>{row.getValue('name')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground text-sm'>
        {row.getValue('description') || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'isSystem',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const isSystem = row.original.isSystem
      return (
        <Badge
          variant='outline'
          className={cn(
            'capitalize',
            isSystem
              ? 'border-orange-500 text-orange-500'
              : 'border-blue-500 text-blue-500'
          )}
        >
          {isSystem ? 'System' : 'Custom'}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'permissionCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permissions' />
    ),
    cell: ({ row }) => {
      const count = row.original.permissions?.length ?? 0
      return (
        <Badge variant='secondary'>{count}</Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
