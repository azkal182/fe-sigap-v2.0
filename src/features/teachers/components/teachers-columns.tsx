import { type ColumnDef } from '@tanstack/react-table'
import { Building2, CheckCircle2, Phone, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Teacher } from '../services/teacher-service'
import { DataTableRowActions } from './data-table-row-actions'

// ─── Dormitory badges sub-component ──────────────────────────────────────────

function DormitoryBadges({
  dormitories,
}: {
  dormitories: { id: string; name: string }[]
}) {
  const MAX_VISIBLE = 2
  const visible = dormitories.slice(0, MAX_VISIBLE)
  const extra = dormitories.length - MAX_VISIBLE

  if (dormitories.length === 0) {
    return <span className='ps-2 text-xs text-muted-foreground italic'>—</span>
  }

  return (
    <div className='flex flex-wrap items-center gap-1 ps-2'>
      {visible.map((d) => (
        <div
          key={d.id}
          className='flex items-center gap-1 rounded-md border px-1.5 py-0.5'
        >
          <Building2 size={10} className='shrink-0 text-muted-foreground' />
          <span className='text-[11px]'>{d.name}</span>
        </div>
      ))}
      {extra > 0 && (
        <Badge variant='outline' className='h-5 px-1.5 text-[10px]'>
          +{extra} more
        </Badge>
      )}
    </div>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

export const teachersColumns: ColumnDef<Teacher>[] = [
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
    meta: {
      className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
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
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Telepon' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue<string | undefined>('phone')
      if (!phone) {
        return (
          <span className='ps-2 text-xs text-muted-foreground italic'>—</span>
        )
      }
      return (
        <div className='flex items-center gap-1.5 ps-2 text-sm'>
          <Phone size={11} className='shrink-0 text-muted-foreground' />
          {phone}
        </div>
      )
    },
  },
  {
    id: 'dormitories',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Asrama' />
    ),
    cell: ({ row }) => (
      <DormitoryBadges dormitories={row.original.dormitories ?? []} />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive
      return (
        <div className='flex space-x-2 ps-2'>
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
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'login',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Login' />
    ),
    cell: ({ row }) => {
      const hasUser = !!row.original.userId
      return hasUser ? (
        <div className='inline-flex items-center gap-1 ps-2 text-xs text-emerald-600 dark:text-emerald-400'>
          <CheckCircle2 size={13} />
          Has Login
        </div>
      ) : (
        <div className='inline-flex items-center gap-1 ps-2 text-xs text-muted-foreground'>
          <XCircle size={13} />
          No Login
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
