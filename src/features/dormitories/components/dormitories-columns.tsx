import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Dormitory } from '../services/dormitory-service'
import { DataTableRowActions } from './data-table-row-actions'

const GENDER_LABELS = {
  PUTRA: { label: 'Putra', className: 'border-blue-500 text-blue-500' },
  PUTRI: { label: 'Putri', className: 'border-pink-500 text-pink-500' },
}

export const dormitoriesColumns: ColumnDef<Dormitory>[] = [
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
    meta: { className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky') },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dormitory Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-56 ps-3'>{row.getValue('name')}</LongText>
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
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Level' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary'>Level {row.getValue('level')}</Badge>
    ),
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gender' />
    ),
    cell: ({ row }) => {
      const gender = row.getValue<string>('gender')
      const config = GENDER_LABELS[gender as keyof typeof GENDER_LABELS]
      return (
        <Badge
          variant='outline'
          className={cn('capitalize', config?.className)}
        >
          {config?.label ?? gender}
        </Badge>
      )
    },
    filterFn: (row, id, filterValues: string[]) =>
      filterValues.includes(row.getValue(id)),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive
      return (
        <Badge
          variant='outline'
          className={cn(
            'capitalize',
            isActive
              ? 'border-green-600 text-green-600'
              : 'border-red-600 text-red-600'
          )}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    filterFn: (row, id, filterValues: string[]) =>
      filterValues.includes(String(row.getValue(id))),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
