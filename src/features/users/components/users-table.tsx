import { useEffect, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataTablePagination,
  DataTableFacetedFilter,
  DataTableViewOptions,
} from '@/components/data-table'
import { type User } from '../services/user-service'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'

type UsersSearchParams = {
  page?: number
  pageSize?: number
  search?: string
  isActive?: string
  [key: string]: unknown
}

type DataTableProps = {
  data: User[]
  search: UsersSearchParams
  navigate: NavigateFn
  isLoading?: boolean
  totalPages?: number
}

const IS_ACTIVE_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function UsersTable({
  data,
  search,
  navigate,
  isLoading,
  totalPages,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Search text – controlled directly via URL
  const searchText = (search.search as string) || ''

  // isActive filter – stored as comma-joined string in URL e.g. "true" | "false" | "true,false" | undefined
  const isActiveParam = search.isActive as string | undefined
  const isActiveSelected: string[] = isActiveParam
    ? isActiveParam.split(',').filter(Boolean)
    : []

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [],
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    pageCount: totalPages ?? -1,
    manualPagination: true,
    manualFiltering: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  // Handlers that update URL params directly
  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...(prev as UsersSearchParams),
        page: undefined,
        search: value || undefined,
      }),
    })
  }

  const handleIsActiveChange = (values: string[]) => {
    navigate({
      search: (prev) => ({
        ...(prev as UsersSearchParams),
        page: undefined,
        isActive: values.length > 0 ? values.join(',') : undefined,
      }),
    })
  }

  const handleResetFilters = () => {
    navigate({
      search: (prev) => ({
        ...(prev as UsersSearchParams),
        page: undefined,
        search: undefined,
        isActive: undefined,
      }),
    })
  }

  const isFiltered = !!searchText || isActiveSelected.length > 0

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      {/* Toolbar */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Search users...'
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='h-8 w-37.5 lg:w-62.5'
          />
          <div className='flex gap-x-2'>
            <IsActiveFilter
              selected={isActiveSelected}
              onChange={handleIsActiveChange}
            />
          </div>
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={handleResetFilters}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
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
                  )
                })}
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
                  <div className='flex items-center justify-center'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}

// Custom isActive filter component (not tied to table column filter state)
type IsActiveFilterProps = {
  selected: string[]
  onChange: (values: string[]) => void
}

function IsActiveFilter({ selected, onChange }: IsActiveFilterProps) {
  const selectedSet = new Set(selected)

  const toggle = (value: string) => {
    const next = new Set(selectedSet)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    onChange(Array.from(next))
  }

  return (
    <DataTableFacetedFilter
      title='Status'
      options={IS_ACTIVE_OPTIONS}
      selectedValues={selectedSet}
      onSelect={toggle}
      onClear={() => onChange([])}
    />
  )
}
