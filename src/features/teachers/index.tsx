import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TeacherListCard } from './components/teacher-list-card'

export function Teachers() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-5'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Teachers</h2>
          <p className='text-muted-foreground'>
            Manage teacher profiles, dormitory assignments, and login accounts.
          </p>
        </div>

        <TeacherListCard />
      </Main>
    </>
  )
}
