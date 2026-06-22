import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TeachersDialogs } from './components/teachers-dialogs'
import { TeachersPrimaryButtons } from './components/teachers-primary-buttons'
import { TeachersProvider } from './components/teachers-provider'
import { TeachersTable } from './components/teachers-table'
import { useTeachers } from './hooks/use-teachers'

const route = getRouteApi('/_authenticated/teachers/')

export function Teachers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Parse isActive filter: "true" → true, "false" → false, multi/undefined → undefined
  const parseIsActive = (): boolean | undefined => {
    if (!search.isActive) return undefined
    const vals = search.isActive.split(',').filter(Boolean)
    if (vals.length === 1) return vals[0] === 'true'
    return undefined
  }

  const { data, isLoading } = useTeachers({
    page: search.page || 1,
    limit: search.pageSize || 10,
    search: search.search || undefined,
    dormitoryId: search.dormitoryId || undefined,
    isActive: parseIsActive(),
    includeDetails: true,
  })

  return (
    <TeachersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Teacher List</h2>
            <p className='text-muted-foreground'>
              Manage your teachers and their dormitory assignments here.
            </p>
          </div>
          <TeachersPrimaryButtons />
        </div>

        <TeachersTable
          data={data?.data || []}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
          totalPages={data?.meta?.totalPages}
        />
      </Main>

      <TeachersDialogs />
    </TeachersProvider>
  )
}
