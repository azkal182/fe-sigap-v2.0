import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Student, type StudentStatus } from '../services/student-service'
import { DataTableRowActions } from './data-table-row-actions'

const STATUS_CONFIG: Record<
  StudentStatus,
  { label: string; className: string }
> = {
  ACTIVE: { label: 'Active', className: 'border-green-600 text-green-600' },
  TRANSFERRED: {
    label: 'Transferred',
    className: 'border-yellow-600 text-yellow-600',
  },
  GRADUATED: { label: 'Graduated', className: 'border-blue-600 text-blue-600' },
}

const GENDER_CONFIG = {
  PUTRA: { label: 'Putra', className: 'border-sky-500 text-sky-500' },
  PUTRI: { label: 'Putri', className: 'border-pink-500 text-pink-500' },
}

export const studentsColumns: ColumnDef<Student>[] = [
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
    accessorKey: 'nis',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='NIS' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-sm'>{row.getValue('nis')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
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
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gender' />
    ),
    cell: ({ row }) => {
      const gender = row.getValue<string>('gender')
      if (!gender) return <span className='text-muted-foreground'>—</span>
      const config = GENDER_CONFIG[gender as keyof typeof GENDER_CONFIG]
      return (
        <Badge variant='outline' className={cn(config?.className)}>
          {config?.label ?? gender}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'dormitory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dormitory' />
    ),
    cell: ({ row }) => {
      const dormitory = row.original.dormitory
      if (!dormitory) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }
      return (
        <div className='flex flex-col'>
          <span className='text-sm font-medium'>{dormitory.name}</span>
          <span className='text-xs text-muted-foreground'>
            Level {dormitory.level}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue<StudentStatus>('status')
      const config = STATUS_CONFIG[status]
      return (
        <Badge variant='outline' className={cn(config?.className)}>
          {config?.label ?? status}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
