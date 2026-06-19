import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DormitoriesDialogs } from './components/dormitories-dialogs'
import {
  DormitoriesProvider,
  useDormitoriesContext,
} from './components/dormitories-provider'
import { DormitoriesTable } from './components/dormitories-table'
import { useDormitories } from './hooks/use-dormitories'

const route = getRouteApi('/_authenticated/dormitories/')

function DormitoriesPageContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useDormitoriesContext()

  const { data, isLoading } = useDormitories({
    page: search.page || 1,
    limit: search.pageSize || 10,
    search: search.search || undefined,
    gender: (search.gender as 'PUTRA' | 'PUTRI') || undefined,
    level: search.level ? Number(search.level) : undefined,
    isActive:
      search.isActive === 'true'
        ? true
        : search.isActive === 'false'
          ? false
          : undefined,
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
            <h2 className='text-2xl font-bold tracking-tight'>Dormitories</h2>
            <p className='text-muted-foreground'>
              Manage dormitory rooms and their assignments here.
            </p>
          </div>
          <Button className='space-x-1' onClick={() => setOpen('add')}>
            <span>Add Dormitory</span> <Plus size={18} />
          </Button>
        </div>

        <DormitoriesTable
          data={data?.data || []}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
          totalPages={data?.meta?.totalPages}
        />
      </Main>

      <DormitoriesDialogs />
    </>
  )
}

export function Dormitories() {
  return (
    <DormitoriesProvider>
      <DormitoriesPageContent />
    </DormitoriesProvider>
  )
}
