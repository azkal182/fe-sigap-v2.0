import { useEffect, useMemo, useState } from 'react'
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
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DataTable,
  DataTableFacetedFilter,
  DataTableViewOptions,
} from '@/components/data-table'
import { useDormitories } from '@/features/users/hooks/use-users'
import { teachersColumns as columns } from './teachers-columns'

type TeachersSearchParams = {
  page?: number
  pageSize?: number
  search?: string
  dormitoryId?: string
  isActive?: string
  [key: string]: unknown
}

type TeachersTableProps = {
  data: import('../services/teacher-service').Teacher[]
  search: TeachersSearchParams
  navigate: NavigateFn
  isLoading?: boolean
  totalPages?: number
}

const IS_ACTIVE_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function TeachersTable({
  data,
  search,
  navigate,
  isLoading,
  totalPages,
}: TeachersTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // ── URL-derived filter values ─────────────────────────────────────────────
  const searchText = (search.search as string) || ''
  const dormitoryFilter = (search.dormitoryId as string) || ''
  const isActiveParam = search.isActive as string | undefined
  const isActiveSelected = isActiveParam
    ? isActiveParam.split(',').filter(Boolean)
    : []

  // ── Dormitory options ─────────────────────────────────────────────────────
  const { data: dormitoriesData } = useDormitories({ limit: 100 })
  const dormitoryOptions = useMemo(
    () =>
      (dormitoriesData?.data ?? []).map((d) => ({
        label: `${d.name} (${d.gender})`,
        value: d.id,
      })),
    [dormitoriesData]
  )

  const dormitorySelected = useMemo(
    () => new Set(dormitoryFilter ? [dormitoryFilter] : []),
    [dormitoryFilter]
  )
  const isActiveSelectedSet = useMemo(
    () => new Set(isActiveSelected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isActiveParam]
  )

  // ── URL state ─────────────────────────────────────────────────────────────
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

  // ── URL navigation helpers ─────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...(prev as TeachersSearchParams),
        page: undefined,
        search: value || undefined,
      }),
    })
  }

  const handleDormitorySelect = (value: string) => {
    navigate({
      search: (prev) => ({
        ...(prev as TeachersSearchParams),
        page: undefined,
        dormitoryId: dormitoryFilter === value ? undefined : value,
      }),
    })
  }

  const handleIsActiveToggle = (value: string) => {
    const next = new Set(isActiveSelectedSet)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    navigate({
      search: (prev) => ({
        ...(prev as TeachersSearchParams),
        page: undefined,
        isActive: next.size > 0 ? Array.from(next).join(',') : undefined,
      }),
    })
  }

  const handleResetFilters = () => {
    navigate({
      search: (prev) => ({
        ...(prev as TeachersSearchParams),
        page: undefined,
        search: undefined,
        dormitoryId: undefined,
        isActive: undefined,
      }),
    })
  }

  const isFiltered = !!(
    searchText ||
    dormitoryFilter ||
    isActiveSelected.length > 0
  )

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      {/* Toolbar */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Search teachers...'
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='h-8 w-37.5 lg:w-62.5'
          />

          <DataTableFacetedFilter
            title='Dormitory'
            options={dormitoryOptions}
            selectedValues={dormitorySelected}
            onSelect={handleDormitorySelect}
            onClear={() =>
              navigate({
                search: (prev) => ({
                  ...(prev as TeachersSearchParams),
                  page: undefined,
                  dormitoryId: undefined,
                }),
              })
            }
          />

          <DataTableFacetedFilter
            title='Status'
            options={IS_ACTIVE_OPTIONS}
            selectedValues={isActiveSelectedSet}
            onSelect={handleIsActiveToggle}
            onClear={() =>
              navigate({
                search: (prev) => ({
                  ...(prev as TeachersSearchParams),
                  page: undefined,
                  isActive: undefined,
                }),
              })
            }
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
        emptyText='No teachers found.'
      />
    </div>
  )
}
