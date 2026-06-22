import { useEffect, useMemo, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
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
import { type Student } from '../services/student-service'
import { studentsColumns as columns } from './students-columns'
import { useDormitoryOptions } from './use-dormitory-options'

type StudentsSearchParams = {
  page?: number
  pageSize?: number
  search?: string
  gender?: string
  status?: string
  dormitoryId?: string
  [key: string]: unknown
}

type StudentsTableProps = {
  data: Student[]
  search: StudentsSearchParams
  navigate: NavigateFn
  isLoading?: boolean
  totalPages?: number
}

const GENDER_OPTIONS = [
  { label: 'Putra', value: 'PUTRA' },
  { label: 'Putri', value: 'PUTRI' },
]

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Transferred', value: 'TRANSFERRED' },
  { label: 'Graduated', value: 'GRADUATED' },
]

export function StudentsTable({
  data,
  search,
  navigate,
  isLoading,
  totalPages,
}: StudentsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const dormitoryOptions = useDormitoryOptions()

  const searchText = (search.search as string) || ''
  const genderFilter = (search.gender as string) || ''
  const statusFilter = (search.status as string) || ''
  const dormitoryFilter = (search.dormitoryId as string) || ''

  const genderSelected = useMemo(
    () => new Set(genderFilter ? [genderFilter] : []),
    [genderFilter]
  )
  const statusSelected = useMemo(
    () => new Set(statusFilter ? [statusFilter] : []),
    [statusFilter]
  )
  const dormitorySelected = useMemo(
    () => new Set(dormitoryFilter ? [dormitoryFilter] : []),
    [dormitoryFilter]
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
      columnVisibility,
    },
    enableRowSelection: true,
    pageCount: totalPages ?? -1,
    manualPagination: true,
    manualFiltering: true,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  const updateFilter = (key: string, value: string | undefined) => {
    navigate({
      search: (prev) => ({
        ...(prev as StudentsSearchParams),
        page: undefined,
        [key]: value,
      }),
    })
  }

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...(prev as StudentsSearchParams),
        page: undefined,
        search: value || undefined,
      }),
    })
  }

  const handleResetFilters = () => {
    navigate({
      search: (prev) => ({
        ...(prev as StudentsSearchParams),
        page: undefined,
        search: undefined,
        gender: undefined,
        status: undefined,
        dormitoryId: undefined,
      }),
    })
  }

  const isFiltered = !!(
    searchText ||
    genderFilter ||
    statusFilter ||
    dormitoryFilter
  )

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Search students...'
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='h-8 w-48 lg:w-64'
          />

          <DataTableFacetedFilter
            title='Gender'
            options={GENDER_OPTIONS}
            selectedValues={genderSelected}
            onSelect={(v) =>
              updateFilter('gender', genderFilter === v ? undefined : v)
            }
            onClear={() => updateFilter('gender', undefined)}
          />

          <DataTableFacetedFilter
            title='Status'
            options={STATUS_OPTIONS}
            selectedValues={statusSelected}
            onSelect={(v) =>
              updateFilter('status', statusFilter === v ? undefined : v)
            }
            onClear={() => updateFilter('status', undefined)}
          />

          <DataTableFacetedFilter
            title='Dormitory'
            options={dormitoryOptions}
            selectedValues={dormitorySelected}
            onSelect={(v) =>
              updateFilter('dormitoryId', dormitoryFilter === v ? undefined : v)
            }
            onClear={() => updateFilter('dormitoryId', undefined)}
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
        emptyText='No students found.'
      />
    </div>
  )
}
