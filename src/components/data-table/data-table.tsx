import { type ColumnDef, type Table, flexRender } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table as TableRoot,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'

type DataTableProps<TData> = {
  /** Instance tabel dari useReactTable() */
  table: Table<TData>
  /** Definisi kolom — digunakan untuk menghitung colSpan pada loading/empty state */
  columns: ColumnDef<TData>[]
  /** Tampilkan loading spinner di body tabel */
  isLoading?: boolean
  /** Teks yang ditampilkan saat tidak ada data */
  emptyText?: string
  /** Slot opsional untuk bulk actions bar (misal: DataTableBulkActions) */
  bulkActions?: React.ReactNode
  /** className tambahan untuk wrapper terluar */
  className?: string
}

export function DataTable<TData>({
  table,
  columns,
  isLoading,
  emptyText = 'No results.',
  bulkActions,
  className,
}: DataTableProps<TData>) {
  return (
    <div className={cn('flex flex-1 flex-col gap-4', className)}>
      {/* Table */}
      <div className='overflow-hidden rounded-md border'>
        <TableRoot>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} className='mt-auto' />

      {/* Bulk actions bar (opsional) */}
      {bulkActions}
    </div>
  )
}
