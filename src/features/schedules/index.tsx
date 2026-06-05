import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CalendarDays, Construction } from 'lucide-react'

export function Schedules() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Schedules</h2>
            <p className='text-muted-foreground'>
              Manage class schedules and time slots.
            </p>
          </div>
        </div>

        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed p-12'>
          <div className='flex flex-col items-center gap-3 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
              <CalendarDays className='h-8 w-8 text-muted-foreground' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>Schedules — Coming Soon</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                This feature is under construction.
              </p>
            </div>
            <Construction className='h-5 w-5 text-muted-foreground' />
          </div>
        </div>
      </Main>
    </>
  )
}
