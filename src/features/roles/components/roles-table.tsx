import { useEffect, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, DataTableViewOptions } from '@/components/data-table'
import { type Role } from '../services/role-service'
import { rolesColumns as columns } from './roles-columns'

type RolesSearchParams = {
  page?: number
  pageSize?: number
  search?: string
  [key: string]: unknown
}

type RolesTableProps = {
  data: Role[]
  search: RolesSearchParams
  navigate: NavigateFn
  isLoading?: boolean
  totalPages?: number
}

export function RolesTable({
  data,
  search,
  navigate,
  isLoading,
  totalPages,
}: RolesTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const searchText = (search.search as string) || ''

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

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...(prev as RolesSearchParams),
        page: undefined,
        search: value || undefined,
      }),
    })
  }

  const handleResetFilters = () => {
    navigate({
      search: (prev) => ({
        ...(prev as RolesSearchParams),
        page: undefined,
        search: undefined,
      }),
    })
  }

  const isFiltered = !!searchText

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Search roles...'
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='h-8 w-37.5 lg:w-62.5'
          />
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

      <DataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyText='No roles found.'
      />
    </div>
  )
}
