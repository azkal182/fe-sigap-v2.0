import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useStudents } from './hooks/use-students'
import { StudentsDialogs } from './components/students-dialogs'
import { StudentsProvider } from './components/students-provider'
import { StudentsTable } from './components/students-table'
import { useStudentsContext } from './components/students-provider'

const route = getRouteApi('/_authenticated/students/')

function StudentsPageContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useStudentsContext()

  const { data, isLoading } = useStudents({
    page: search.page || 1,
    limit: search.pageSize || 10,
    search: search.search || undefined,
    gender: (search.gender as 'PUTRA' | 'PUTRI') || undefined,
    status: (search.status as 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED') || undefined,
    dormitoryId: search.dormitoryId || undefined,
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Students</h2>
            <p className='text-muted-foreground'>
              Manage student records and dormitory assignments.
            </p>
          </div>
          <Button className='space-x-1' onClick={() => setOpen('add')}>
            <span>Add Student</span> <Plus size={18} />
          </Button>
        </div>

        <StudentsTable
          data={data?.data || []}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
          totalPages={data?.meta?.totalPages}
        />
      </Main>

      <StudentsDialogs />
    </>
  )
}

export function Students() {
  return (
    <StudentsProvider>
      <StudentsPageContent />
    </StudentsProvider>
  )
}
