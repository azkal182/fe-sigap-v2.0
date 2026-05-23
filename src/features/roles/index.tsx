import { getRouteApi } from '@tanstack/react-router'
import { ShieldPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRoles } from './hooks/use-roles'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesProvider } from './components/roles-provider'
import { RolesTable } from './components/roles-table'
import { useRolesContext } from './components/roles-provider'

const route = getRouteApi('/_authenticated/roles/')

function RolesPageContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useRolesContext()

  const { data, isLoading } = useRoles({
    page: search.page || 1,
    limit: search.pageSize || 10,
    search: search.search || '',
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
            <h2 className='text-2xl font-bold tracking-tight'>Roles</h2>
            <p className='text-muted-foreground'>
              Manage roles and their permissions here.
            </p>
          </div>
          <Button className='space-x-1' onClick={() => setOpen('add')}>
            <span>Add Role</span> <ShieldPlus size={18} />
          </Button>
        </div>

        <RolesTable
          data={data?.data || []}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
          totalPages={data?.meta?.totalPages}
        />
      </Main>

      <RolesDialogs />
    </>
  )
}

export function Roles() {
  return (
    <RolesProvider>
      <RolesPageContent />
    </RolesProvider>
  )
}
