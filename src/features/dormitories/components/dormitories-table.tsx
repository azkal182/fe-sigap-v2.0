import { useEffect, useMemo, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  type ColumnFiltersState,
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
import {
  DataTable,
  DataTableViewOptions,
  DataTableFacetedFilter,
} from '@/components/data-table'
import { type Dormitory } from '../services/dormitory-service'
import { dormitoriesColumns as columns } from './dormitories-columns'

type DormitoriesSearchParams = {
  page?: number
  pageSize?: number
  search?: string
  gender?: string
  level?: string
  isActive?: string
  [key: string]: unknown
}

type DormitoriesTableProps = {
  data: Dormitory[]
  search: DormitoriesSearchParams
  navigate: NavigateFn
  isLoading?: boolean
  totalPages?: number
}

const GENDER_OPTIONS = [
  { label: 'Putra', value: 'PUTRA' },
  { label: 'Putri', value: 'PUTRI' },
]

const LEVEL_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  label: `Level ${i + 1}`,
  value: String(i + 1),
}))

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function DormitoriesTable({
  data,
  search,
  navigate,
  isLoading,
  totalPages,
}: DormitoriesTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // URL-synced state
  const searchText = (search.search as string) || ''
  const genderFilter = (search.gender as string) || ''
  const levelFilter = (search.level as string) || ''
  const statusFilter = (search.isActive as string) || ''

  // Selected sets for faceted filters (server-side — we control the URL)
  const genderSelected = useMemo(
    () => new Set(genderFilter ? [genderFilter] : []),
    [genderFilter]
  )
  const levelSelected = useMemo(
    () => new Set(levelFilter ? [levelFilter] : []),
    [levelFilter]
  )
  const statusSelected = useMemo(
    () => new Set(statusFilter ? [statusFilter] : []),
    [statusFilter]
  )

  const { pagination, onPaginationChange, ensurePageInRange } =
    useTableUrlState({
      search,
      navigate,
      pagination: { defaultPage: 1, defaultPageSize: 10 },
      globalFilter: { enabled: false },
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
    onColumnFiltersChange: setColumnFilters,
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

  // ── URL-based filter helpers ────────────────────────────────────────────────
  const updateUrlFilter = (key: string, value: string | undefined) => {
    navigate({
      search: (prev) => ({
        ...(prev as DormitoriesSearchParams),
        page: undefined,
        [key]: value,
      }),
    })
  }

  const handleGenderSelect = (value: string) => {
    updateUrlFilter('gender', genderFilter === value ? undefined : value)
  }
  const handleLevelSelect = (value: string) => {
    updateUrlFilter('level', levelFilter === value ? undefined : value)
  }
  const handleStatusSelect = (value: string) => {
    updateUrlFilter('isActive', statusFilter === value ? undefined : value)
  }

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...(prev as DormitoriesSearchParams),
        page: undefined,
        search: value || undefined,
      }),
    })
  }

  const handleResetFilters = () => {
    navigate({
      search: (prev) => ({
        ...(prev as DormitoriesSearchParams),
        page: undefined,
        search: undefined,
        gender: undefined,
        level: undefined,
        isActive: undefined,
      }),
    })
  }

  const isFiltered = !!(
    searchText ||
    genderFilter ||
    levelFilter ||
    statusFilter
  )

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Search dormitories...'
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='h-8 w-48 lg:w-64'
          />

          {/* Gender filter */}
          <DataTableFacetedFilter
            title='Gender'
            options={GENDER_OPTIONS}
            selectedValues={genderSelected}
            onSelect={handleGenderSelect}
            onClear={() => updateUrlFilter('gender', undefined)}
          />

          {/* Level filter */}
          <DataTableFacetedFilter
            title='Level'
            options={LEVEL_OPTIONS}
            selectedValues={levelSelected}
            onSelect={handleLevelSelect}
            onClear={() => updateUrlFilter('level', undefined)}
          />

          {/* Status filter */}
          <DataTableFacetedFilter
            title='Status'
            options={STATUS_OPTIONS}
            selectedValues={statusSelected}
            onSelect={handleStatusSelect}
            onClear={() => updateUrlFilter('isActive', undefined)}
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
        emptyText='No dormitories found.'
      />
    </div>
  )
}
